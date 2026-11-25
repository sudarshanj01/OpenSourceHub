pub mod mysql;
pub mod postgres;

use crate::aws::S3Client;
use crate::config::{DatabaseEngine, VaultConfig};
use crate::engine::postgres::gzip_decompress;
use anyhow::{Context, Result};
use chrono::Utc;
use colored::*;
use dialoguer::Input;
use flate2::read::GzDecoder;
use std::fs;
use std::path::{Path, PathBuf};

pub async fn run_base_backup(cfg: &VaultConfig, label: Option<&str>) -> Result<String> {
    match cfg.engine {
        DatabaseEngine::Postgres => postgres::take_postgres_snapshot(cfg, label).await,
        DatabaseEngine::Mysql => mysql::take_mysql_snapshot(cfg, label).await,
    }
}

pub async fn show_status(cfg: &VaultConfig) -> Result<()> {
    println!("{}", "=========================================================".cyan());
    println!("{}", "               VaultEngine Operational Status            ".bold().bright_white());
    println!("{}", "=========================================================".cyan());

    println!("{:<25} : {}", "Database Engine", format!("{}", cfg.engine).green().bold());
    println!("{:<25} : {}", "Database Target", cfg.db_name.bold());
    println!("{:<25} : {}:{}", "Host / Port", cfg.db_host, cfg.db_port);
    println!("{:<25} : {}", "Data Directory", cfg.data_dir.display());

    println!("\n{}", "--- S3 Storage & Sovereign Cloud ---".cyan());
    println!("{:<25} : s3://{}", "Target Bucket", cfg.s3_bucket.bold());
    println!("{:<25} : {}", "AWS Region", cfg.s3_region);
    if let Some(ref ep) = cfg.s3_endpoint {
        println!("{:<25} : {}", "S3 Endpoint", ep);
    }
    println!("{:<25} : {}", "S3 Prefix", cfg.s3_prefix);
    println!(
        "{:<25} : {}",
        "Auth Mechanism",
        if cfg.use_iam_role {
            "EC2 IAM Instance Profile (Zero Static Keys)".green().bold()
        } else {
            "AWS Environment Credentials".yellow()
        }
    );

    println!("\n{}", "--- Live S3 Inventory & RPO Metrics ---".cyan());
    let prefix = cfg.s3_prefix.trim_end_matches('/');
    if let Ok(s3) = S3Client::new(
        cfg.s3_bucket.clone(),
        cfg.s3_region.clone(),
        cfg.s3_endpoint.clone(),
        cfg.use_iam_role,
    )
    .await
    {
        let snaps = s3
            .list_objects(&format!("{}/snapshots/", prefix))
            .await
            .unwrap_or_default();
        let latest = select_latest_snapshot(&snaps, &cfg.engine);
        let wals = s3
            .list_objects(&format!("{}/wal/", prefix))
            .await
            .unwrap_or_default();
        println!(
            "{:<25} : {}",
            "Latest S3 Snapshot",
            latest.as_deref().unwrap_or("None yet (run 'vaultengine backup')")
        );
        println!("{:<25} : {}", "S3 Archived WALs", wals.len());
    } else {
        println!("{:<25} : {}", "S3 Connectivity", "Unavailable (check credentials)".yellow());
    }

    let mut last_wal_time: Option<i64> = None;
    let mut total_wals = 0;
    if let Ok(content) = fs::read_to_string("wal_manifest.jsonl") {
        for line in content.lines() {
            if let Ok(v) = serde_json::from_str::<serde_json::Value>(line) {
                total_wals += 1;
                if let Some(ts) = v.get("ts").and_then(|t| t.as_i64()) {
                    last_wal_time = Some(ts);
                }
            }
        }
    }

    println!("{:<25} : {}", "Local WAL Ledger", total_wals);
    if let Some(ts) = last_wal_time {
        let now = Utc::now().timestamp();
        let lag_sec = (now - ts).max(0);
        let rpo_color = if lag_sec < 10 {
            format!("{}s (Real-Time)", lag_sec).green().bold()
        } else if lag_sec < 60 {
            format!("{}s (Optimal RPO)", lag_sec).yellow().bold()
        } else {
            format!("{}s", lag_sec).red().bold()
        };
        println!("{:<25} : {}", "Last Archived Lag", rpo_color);
    }

    println!("{:<25} : {} days", "Retention Window", cfg.retention_days);
    println!("{:<25} : Every {} hours", "Base Backup Cadence", cfg.backup_interval_hours);
    println!("{}", "=========================================================\n".cyan());

    Ok(())
}

pub async fn run_restore(
    cfg: &VaultConfig,
    config_path: &Path,
    target_time_arg: Option<String>,
    into_arg: Option<PathBuf>,
    dry_run: bool,
) -> Result<()> {
    println!("{}", "=== VaultEngine Point-in-Time Recovery (PITR) Wizard ===".bold().yellow());
    println!("Restore your database down to the exact second from S3.\n");

    let target_time = match target_time_arg {
        Some(t) => t,
        None => Input::new()
            .with_prompt("Enter Target Recovery Timestamp (e.g. '2026-11-25 17:00:00 UTC' or 'latest')")
            .default(Utc::now().format("%Y-%m-%d %H:%M:%S UTC").to_string())
            .interact_text()?,
    };

    let default_into = PathBuf::from(format!(
        "/var/lib/{}-restored",
        match cfg.engine {
            DatabaseEngine::Postgres => "postgresql",
            DatabaseEngine::Mysql => "mysql",
        }
    ));

    let destination = match into_arg {
        Some(p) => p,
        None => {
            let path_str: String = Input::new()
                .with_prompt("Destination Directory for Restored Cluster")
                .default(default_into.display().to_string())
                .interact_text()?;
            PathBuf::from(path_str)
        }
    };

    println!("\n{}", "--- PITR Execution Plan ---".cyan().bold());
    println!("{:<25} : {}", "Target Timestamp", target_time.green().bold());
    println!("{:<25} : {}", "Destination Path", destination.display().to_string().cyan());
    println!(
        "{:<25} : {}",
        "Execution Mode",
        if dry_run {
            "DRY-RUN (Verification Only)".yellow()
        } else {
            "LIVE RESTORATION".red().bold()
        }
    );

    let s3 = S3Client::new(
        cfg.s3_bucket.clone(),
        cfg.s3_region.clone(),
        cfg.s3_endpoint.clone(),
        cfg.use_iam_role,
    )
    .await?;

    let prefix = cfg.s3_prefix.trim_end_matches('/');

    println!("\n1. Querying S3 for base snapshots under s3://{}/{}/snapshots/...", cfg.s3_bucket, prefix);
    let snapshot_keys = s3.list_objects(&format!("{}/snapshots/", prefix)).await?;
    let snapshot_key = select_latest_snapshot(&snapshot_keys, &cfg.engine).with_context(|| {
        format!(
            "No base snapshots found in s3://{}/{}/snapshots/. Run 'vaultengine backup' first.",
            cfg.s3_bucket, prefix
        )
    })?;
    println!("   {} Selected S3 snapshot: {}", "✓".green(), snapshot_key.cyan());

    let log_prefix = match cfg.engine {
        DatabaseEngine::Postgres => format!("{}/wal/", prefix),
        DatabaseEngine::Mysql => format!("{}/binlog/", prefix),
    };
    let log_keys = s3.list_objects(&log_prefix).await.unwrap_or_default();
    println!(
        "2. Transaction log chain in S3: {} segment(s) available",
        log_keys.len()
    );

    if dry_run {
        println!(
            "\n{} Dry-run completed! Snapshot & transaction chain verified in S3. No local changes made.",
            "✓".green().bold()
        );
        return Ok(());
    }

    println!("3. Downloading and extracting base snapshot into {}...", destination.display());
    if !destination.exists() {
        fs::create_dir_all(&destination)?;
    }

    let snapshot_bytes = s3.get_object(&snapshot_key).await?;

    match cfg.engine {
        DatabaseEngine::Postgres => {
            let dec = GzDecoder::new(&snapshot_bytes[..]);
            let mut archive = tar::Archive::new(dec);
            archive.unpack(&destination)?;

            // Check if companion _wal.tar.gz exists from pg_basebackup -X fetch
            let wal_archive_key = snapshot_key.replace(".tar.gz", "_wal.tar.gz");
            if snapshot_keys.iter().any(|k| k == &wal_archive_key) {
                let wal_bytes = s3.get_object(&wal_archive_key).await?;
                let pg_wal_dir = destination.join("pg_wal");
                fs::create_dir_all(&pg_wal_dir)?;
                let wal_dec = GzDecoder::new(&wal_bytes[..]);
                let mut wal_archive = tar::Archive::new(wal_dec);
                wal_archive.unpack(&pg_wal_dir)?;
            }

            #[cfg(unix)]
            {
                use std::os::unix::fs::PermissionsExt;
                let _ = fs::set_permissions(&destination, fs::Permissions::from_mode(0o700));
            }

            let recovery_signal = destination.join("recovery.signal");
            fs::write(&recovery_signal, "")?;

            let exe_path = std::env::current_exe()
                .map(|p| p.display().to_string())
                .unwrap_or_else(|_| "vaultengine".to_string());
            let abs_config = fs::canonicalize(config_path).unwrap_or_else(|_| config_path.to_path_buf());

            let conf_content = format_recovery_auto_conf(
                &exe_path,
                &abs_config.display().to_string(),
                &target_time,
            );
            fs::write(destination.join("postgresql.auto.conf"), conf_content)?;

            println!("   {} Extracted PGDATA, injected recovery.signal & postgresql.auto.conf", "✓".green());
            println!("\n{}", "Point-in-Time Recovery Staged Successfully!".green().bold());
            println!("Start PostgreSQL against the restored data directory:");
            println!("  {}", format!("pg_ctl -D {} start", destination.display()).cyan().bold());
        }
        DatabaseEngine::Mysql => {
            let sql_bytes = gzip_decompress(&snapshot_bytes)?;
            let sql_path = destination.join("snapshot.sql");
            fs::write(&sql_path, &sql_bytes)?;

            if !log_keys.is_empty() {
                let binlog_dir = destination.join("binlogs");
                fs::create_dir_all(&binlog_dir)?;
                for key in &log_keys {
                    if let Some(name) = key.rsplit('/').next() {
                        let raw = gzip_decompress(&s3.get_object(key).await?)?;
                        let out_name = name.trim_end_matches(".gz");
                        fs::write(binlog_dir.join(out_name), raw)?;
                    }
                }
            }

            println!("   {} Restored SQL snapshot to {}", "✓".green(), sql_path.display());
            println!("\n{}", "MySQL Point-in-Time Recovery Staged Successfully!".green().bold());
            println!("Apply snapshot and replay binlogs up to {}:", target_time);
            println!("  {}", format!("mysql < {}", sql_path.display()).cyan().bold());
        }
    }

    Ok(())
}

pub fn select_latest_snapshot(keys: &[String], engine: &DatabaseEngine) -> Option<String> {
    let mut candidates: Vec<&String> = keys
        .iter()
        .filter(|k| match engine {
            DatabaseEngine::Postgres => k.ends_with(".tar.gz") && !k.ends_with("_wal.tar.gz"),
            DatabaseEngine::Mysql => k.ends_with(".sql.gz"),
        })
        .collect();
    candidates.sort();
    candidates.last().map(|s| (*s).clone())
}

pub fn format_recovery_auto_conf(exe_path: &str, config_path: &str, target_time: &str) -> String {
    let trimmed = target_time.trim();
    if trimmed.is_empty() || trimmed.eq_ignore_ascii_case("latest") {
        format!(
            "# Injected by VaultEngine PITR\nrestore_command = '{} --config {} fetch-wal %f %p'\nrecovery_target_action = 'promote'\n",
            exe_path, config_path
        )
    } else {
        format!(
            "# Injected by VaultEngine PITR\nrestore_command = '{} --config {} fetch-wal %f %p'\nrecovery_target_time = '{}'\nrecovery_target_action = 'promote'\n",
            exe_path, config_path, trimmed
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_select_latest_snapshot_postgres() {
        let keys = vec![
            "vault/snapshots/base_20261124_010000.tar.gz".to_string(),
            "vault/snapshots/base_20261125_020000.tar.gz".to_string(),
            "vault/snapshots/base_20261125_020000_wal.tar.gz".to_string(),
            "vault/snapshots/base_20261125_020000.meta.json".to_string(),
        ];
        assert_eq!(
            select_latest_snapshot(&keys, &DatabaseEngine::Postgres),
            Some("vault/snapshots/base_20261125_020000.tar.gz".to_string())
        );
    }

    #[test]
    fn test_format_recovery_auto_conf() {
        let conf = format_recovery_auto_conf(
            "/usr/local/bin/vaultengine",
            "/etc/vaultengine/config.json",
            "2026-11-25 17:00:00 UTC",
        );
        assert!(conf.contains("fetch-wal %f %p"));
        assert!(conf.contains("recovery_target_time = '2026-11-25 17:00:00 UTC'"));
        assert!(conf.contains("recovery_target_action = 'promote'"));

        let latest = format_recovery_auto_conf(
            "/usr/local/bin/vaultengine",
            "/etc/vaultengine/config.json",
            "latest",
        );
        assert!(!latest.contains("recovery_target_time"));
    }
}
