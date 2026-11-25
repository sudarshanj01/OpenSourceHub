use crate::config::{DatabaseEngine, VaultConfig};
use anyhow::Result;
use chrono::Utc;
use colored::*;
use std::collections::HashMap;
use std::time::Duration;
use tokio::time::sleep;

pub async fn run_daemon(cfg: &VaultConfig) -> Result<()> {
    println!("{}", "=========================================================".cyan());
    println!("{}", "       VaultEngine Continuous Daemon Worker Running       ".bold().bright_white());
    println!("{}", "=========================================================".cyan());
    println!("Database Engine : {}", cfg.engine);
    println!("Database Target : {}", cfg.db_name);
    println!("Data Directory  : {}", cfg.data_dir.display());
    println!("S3 Target       : s3://{}/{}", cfg.s3_bucket, cfg.s3_prefix);
    println!("Auth Mode       : {}", if cfg.use_iam_role { "EC2 IAM Profile" } else { "AWS Credentials" });
    println!("Backup Cadence  : Every {} hours", cfg.backup_interval_hours);
    println!("Max Spool Limit : {} MB", cfg.max_spool_mb);
    if cfg.engine == DatabaseEngine::Mysql {
        println!("Binlog Sync     : Automatic every 5s (real-time)");
    }
    println!();

    let mut last_backup_time = Utc::now();
    let backup_interval = Duration::from_secs(cfg.backup_interval_hours as u64 * 3600);
    let mut uploaded_binlogs: HashMap<String, u64> = HashMap::new();

    loop {
        // 1. Spool & Disk Watermark Safety Check
        check_disk_watermark(cfg);

        // 2. Automatic MySQL Binlog Watcher (real-time continuous S3 streaming)
        if cfg.engine == DatabaseEngine::Mysql {
            match crate::engine::mysql::sync_mysql_binlogs(cfg, &mut uploaded_binlogs).await {
                Ok(count) if count > 0 => {
                    println!(
                        "{} Auto-archived {} MySQL binlog segment(s) to S3",
                        "[BINLOG]".green().bold(),
                        count
                    );
                }
                Ok(_) => {}
                Err(e) => {
                    eprintln!(
                        "{} Failed to sync MySQL binlogs: {}",
                        "[WARN]".yellow().bold(),
                        e
                    );
                }
            }
        }

        // 3. Periodic Scheduled Base Backup Check
        if Utc::now().signed_duration_since(last_backup_time).num_seconds() >= backup_interval.as_secs() as i64 {
            println!("{} Triggering scheduled base backup...", "[SCHEDULED]".cyan().bold());
            match crate::engine::run_base_backup(cfg, Some("scheduled_cadence")).await {
                Ok(id) => {
                    println!("{} Scheduled backup completed: {}", "✓".green().bold(), id);
                    last_backup_time = Utc::now();
                }
                Err(e) => {
                    eprintln!("{} Failed to complete scheduled backup: {}", "[ERROR]".red().bold(), e);
                }
            }
        }

        sleep(Duration::from_secs(5)).await;
    }
}

fn check_disk_watermark(cfg: &VaultConfig) {
    let spool_dir = std::path::Path::new("spool");
    if spool_dir.exists() {
        let mut total_bytes = 0u64;
        if let Ok(entries) = std::fs::read_dir(spool_dir) {
            for entry in entries.flatten() {
                if let Ok(meta) = entry.metadata() {
                    total_bytes += meta.len();
                }
            }
        }
        let total_mb = total_bytes / (1024 * 1024);
        if total_mb > (cfg.max_spool_mb * 85 / 100) {
            eprintln!(
                "{} WARNING: Local spool storage reached {}MB (85% of {}MB limit). Backpressure throttling active.",
                "[WATERMARK]".yellow().bold(),
                total_mb,
                cfg.max_spool_mb
            );
        }
    }
}
