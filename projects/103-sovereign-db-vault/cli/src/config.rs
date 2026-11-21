use anyhow::Result;
use colored::*;
use dialoguer::{Confirm, Input, Select};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum DatabaseEngine {
    Postgres,
    Mysql,
}

impl std::fmt::Display for DatabaseEngine {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            DatabaseEngine::Postgres => write!(f, "PostgreSQL"),
            DatabaseEngine::Mysql => write!(f, "MySQL / MariaDB"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VaultConfig {
    pub engine: DatabaseEngine,
    pub db_name: String,
    pub db_host: String,
    pub db_port: u16,
    pub db_user: String,
    pub db_password: Option<String>,
    pub data_dir: PathBuf,

    pub s3_bucket: String,
    pub s3_region: String,
    pub s3_endpoint: Option<String>,
    pub s3_prefix: String,
    pub use_iam_role: bool,

    pub retention_days: u32,
    pub backup_interval_hours: u32,
    pub max_spool_mb: u64,
}

impl Default for VaultConfig {
    fn default() -> Self {
        Self {
            engine: DatabaseEngine::Postgres,
            db_name: "production".to_string(),
            db_host: "127.0.0.1".to_string(),
            db_port: 5432,
            db_user: "postgres".to_string(),
            db_password: None,
            data_dir: PathBuf::from("/var/lib/postgresql/data"),
            s3_bucket: format!("vaultengine-{}", chrono::Utc::now().timestamp()),
            s3_region: "us-east-1".to_string(),
            s3_endpoint: None,
            s3_prefix: "vaultengine".to_string(),
            use_iam_role: true,
            retention_days: 30,
            backup_interval_hours: 24,
            max_spool_mb: 5120,
        }
    }
}

pub fn load_config(path: &Path) -> Result<VaultConfig> {
    if !path.exists() {
        // Try fallback to local ./config.json
        let local = Path::new("config.json");
        if local.exists() {
            let data = fs::read_to_string(local)?;
            return Ok(serde_json::from_str(&data)?);
        }
        anyhow::bail!(
            "Configuration file not found at {}. Run 'vaultengine init' first to generate configuration.",
            path.display()
        );
    }
    let data = fs::read_to_string(path)?;
    Ok(serde_json::from_str(&data)?)
}

pub fn save_config(cfg: &VaultConfig, path: &Path) -> Result<()> {
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            let _ = fs::create_dir_all(parent);
        }
    }
    let json = serde_json::to_string_pretty(cfg)?;
    match fs::write(path, &json) {
        Ok(_) => Ok(()),
        Err(_) => {
            // If cannot write to /etc/vaultengine (e.g. without root), fallback to ./config.json
            let local_path = Path::new("config.json");
            fs::write(local_path, &json)?;
            println!("{} Saved configuration to {}", "[INFO]".yellow(), local_path.display());
            Ok(())
        }
    }
}

pub async fn run_init_wizard(target_path: &Path, force: bool) -> Result<()> {
    println!("{}", "=== VaultEngine Guided Setup Wizard ===".bold().green());
    println!("Zero-SaaS • Sovereign Continuous Archiving • Point-in-Time Recovery\n");

    if target_path.exists() && !force {
        let proceed = Confirm::new()
            .with_prompt("Config file already exists. Overwrite?")
            .default(false)
            .interact()?;
        if !proceed {
            println!("Setup aborted.");
            return Ok(());
        }
    }

    // Step 1: Database Engine Selection
    let engines = vec!["PostgreSQL (WAL continuous archiving)", "MySQL / MariaDB (GTID & Binlog streaming)"];
    let engine_idx = Select::new()
        .with_prompt("Select your database engine")
        .items(&engines)
        .default(0)
        .interact()?;

    let engine = if engine_idx == 0 {
        DatabaseEngine::Postgres
    } else {
        DatabaseEngine::Mysql
    };

    let default_port = match engine {
        DatabaseEngine::Postgres => 5432,
        DatabaseEngine::Mysql => 3306,
    };

    let default_data_dir = match engine {
        DatabaseEngine::Postgres => "/var/lib/postgresql/data",
        DatabaseEngine::Mysql => "/var/lib/mysql",
    };

    let default_user = match engine {
        DatabaseEngine::Postgres => "postgres",
        DatabaseEngine::Mysql => "root",
    };

    // Step 2: Connection Details
    let db_name: String = Input::new()
        .with_prompt("Database / Cluster name to protect")
        .default("production".into())
        .interact_text()?;

    let db_host: String = Input::new()
        .with_prompt("Database Host (IP or Socket)")
        .default("127.0.0.1".into())
        .interact_text()?;

    let db_port: u16 = Input::new()
        .with_prompt("Database Port")
        .default(default_port)
        .interact_text()?;

    let db_user: String = Input::new()
        .with_prompt("Database Superuser / Backup User")
        .default(default_user.into())
        .interact_text()?;

    let data_dir_str: String = Input::new()
        .with_prompt("Data Directory Path ($PGDATA or MySQL datadir)")
        .default(default_data_dir.into())
        .interact_text()?;

    // Step 3: AWS IMDSv2 & S3 Configuration
    println!("\n{}", "--- AWS & S3 Storage Configuration ---".cyan().bold());
    println!("Checking EC2 Instance Metadata Service (IMDSv2)...");

    let is_ec2 = crate::aws::check_imds_v2().await;
    let use_iam_role = if is_ec2 {
        println!("{} Detected active EC2 IAM instance profile! Zero static AWS keys required.", "[OK]".green().bold());
        true
    } else {
        println!("{} Not running on EC2 or IMDSv2 unavailable. Will use AWS credentials or custom S3 endpoint.", "[INFO]".yellow());
        false
    };

    let default_bucket = format!("vaultengine-{}-{}", db_name, chrono::Utc::now().timestamp());
    let s3_bucket: String = Input::new()
        .with_prompt("Target S3 Bucket Name (Auto-created if not existing)")
        .default(default_bucket)
        .interact_text()?;

    let s3_region: String = Input::new()
        .with_prompt("AWS / S3 Region")
        .default("us-east-1".into())
        .interact_text()?;

    let custom_endpoint: String = Input::new()
        .with_prompt("Custom S3 Endpoint (Leave empty for standard AWS S3; or MinIO/R2 URL)")
        .default("".into())
        .interact_text()?;

    let s3_endpoint = if custom_endpoint.trim().is_empty() {
        None
    } else {
        Some(custom_endpoint.trim().to_string())
    };

    let retention_days: u32 = Input::new()
        .with_prompt("Continuous Recovery Retention Period (Days)")
        .default(30)
        .interact_text()?;

    let config = VaultConfig {
        engine: engine.clone(),
        db_name: db_name.clone(),
        db_host,
        db_port,
        db_user,
        db_password: None,
        data_dir: PathBuf::from(data_dir_str),
        s3_bucket: s3_bucket.clone(),
        s3_region: s3_region.clone(),
        s3_endpoint,
        s3_prefix: format!("vaultengine/{}", db_name),
        use_iam_role,
        retention_days,
        backup_interval_hours: 24,
        max_spool_mb: 5120,
    };

    save_config(&config, target_path)?;

    println!("\n{}", "🎉 VaultEngine Successfully Initialized!".green().bold());
    println!("Configuration saved to: {}", target_path.display());

    // Print engine-specific configuration instructions
    match engine {
        DatabaseEngine::Postgres => {
            println!("\n{}", "=== ACTION REQUIRED: Add this to your postgresql.conf ===".yellow().bold());
            println!("{}", format!(
r#"# ----------------------------------------------------
# VaultEngine Continuous Archiving Configuration
# ----------------------------------------------------
wal_level = replica
archive_mode = on
archive_command = 'vaultengine archive-wal %p %f'
archive_timeout = 60
# ----------------------------------------------------"#
            ).bright_white());
            println!("\nThen run: {} or {}", "pg_ctl reload".cyan(), "systemctl reload postgresql".cyan());
        }
        DatabaseEngine::Mysql => {
            println!("\n{}", "=== ACTION REQUIRED: Add this to your my.cnf / mysqld.cnf ===".yellow().bold());
            println!("{}", format!(
r#"# ----------------------------------------------------
# VaultEngine Continuous Binlog Configuration
# ----------------------------------------------------
[mysqld]
server-id = 1
log_bin = /var/log/mysql/mysql-bin.log
binlog_format = ROW
binlog_row_image = FULL
gtid_mode = ON
enforce_gtid_consistency = ON
# ----------------------------------------------------"#
            ).bright_white());
            println!("\nThen run: {}", "systemctl restart mysql".cyan());
        }
    }

    // Print systemd service generation
    println!("\n{}", "=== Optional: Run as Systemd Service ===".cyan().bold());
    let service_content = format!(
r#"[Unit]
Description=VaultEngine Sovereign Continuous Database Archiver
After=network.target {service_name}.service

[Service]
Type=simple
ExecStart=/usr/local/bin/vaultengine daemon
Restart=always
RestartSec=5
User=postgres
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
"#,
        service_name = match engine {
            DatabaseEngine::Postgres => "postgresql",
            DatabaseEngine::Mysql => "mysql",
        }
    );

    println!("To install background service:");
    println!("  echo '{}' | sudo tee /etc/systemd/system/vaultengine.service", service_content.trim());
    println!("  sudo systemctl daemon-reload && sudo systemctl enable --now vaultengine");

    Ok(())
}
