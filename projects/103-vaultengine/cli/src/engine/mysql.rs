use crate::aws::S3Client;
use crate::config::VaultConfig;
use crate::engine::postgres::gzip_compress;
use anyhow::{Context, Result};
use chrono::Utc;
use colored::*;
use flate2::Compression;
use indicatif::{ProgressBar, ProgressStyle};
use sha2::{Digest, Sha256};
use std::fs;
use std::path::Path;
use std::process::Command;

pub async fn archive_binlog_segment(
    cfg: &VaultConfig,
    source_path: &Path,
    filename: &str,
) -> Result<()> {
    if !source_path.exists() {
        anyhow::bail!("Source MySQL binlog file does not exist: {}", source_path.display());
    }

    let raw_bytes = fs::read(source_path)
        .with_context(|| format!("Failed to read binlog file {}", source_path.display()))?;
    let compressed = gzip_compress(&raw_bytes, Compression::fast())?;
    let s3_key = format!("{}/binlog/{}.gz", cfg.s3_prefix.trim_end_matches('/'), filename);

    let s3 = S3Client::new(
        cfg.s3_bucket.clone(),
        cfg.s3_region.clone(),
        cfg.s3_endpoint.clone(),
        cfg.use_iam_role,
    )
    .await?;

    s3.put_object(&s3_key, compressed, "application/gzip").await?;
    Ok(())
}

pub async fn take_mysql_snapshot(cfg: &VaultConfig, label: Option<&str>) -> Result<String> {
    let timestamp = Utc::now().format("%Y%m%d_%H%M%S").to_string();
    let snapshot_id = format!("mysql_base_{}", timestamp);
    let prefix = cfg.s3_prefix.trim_end_matches('/');
    let s3_key = format!("{}/snapshots/{}.sql.gz", prefix, snapshot_id);

    println!(
        "{} Initiating consistent hot snapshot for MySQL: {}",
        "[BACKUP]".green().bold(),
        snapshot_id.cyan()
    );

    let pb = ProgressBar::new_spinner();
    pb.set_style(
        ProgressStyle::default_spinner()
            .template("{spinner:.green} {msg}")
            .unwrap(),
    );
    pb.set_message("Executing mysqldump --single-transaction --flush-logs...");

    let mut cmd = Command::new("mysqldump");
    cmd.arg("-h")
        .arg(&cfg.db_host)
        .arg("-P")
        .arg(cfg.db_port.to_string())
        .arg("-u")
        .arg(&cfg.db_user)
        .arg("--all-databases")
        .arg("--single-transaction")
        .arg("--flush-logs")
        .arg("--source-data=2");

    if let Some(ref pw) = cfg.db_password {
        cmd.env("MYSQL_PWD", pw);
    }

    let output = cmd.output().map_err(|e| {
        pb.finish_and_clear();
        if e.kind() == std::io::ErrorKind::NotFound {
            anyhow::anyhow!("mysqldump binary not found on PATH. Install mysql-client to take MySQL snapshots.")
        } else {
            anyhow::anyhow!("Failed to execute mysqldump: {}", e)
        }
    })?;

    if !output.status.success() {
        pb.finish_and_clear();
        let stderr = String::from_utf8_lossy(&output.stderr);
        anyhow::bail!("mysqldump failed ({}): {}", output.status, stderr.trim());
    }

    let compressed = gzip_compress(&output.stdout, Compression::default())?;
    let size_bytes = compressed.len();
    let checksum = hex::encode(Sha256::digest(&compressed));

    pb.set_message("Streaming compressed MySQL snapshot to S3...");

    let s3 = S3Client::new(
        cfg.s3_bucket.clone(),
        cfg.s3_region.clone(),
        cfg.s3_endpoint.clone(),
        cfg.use_iam_role,
    )
    .await?;

    s3.ensure_bucket().await?;
    s3.put_object(&s3_key, compressed, "application/gzip").await?;

    let meta = serde_json::json!({
        "snapshot_id": snapshot_id,
        "engine": "mysql",
        "cluster": cfg.db_name,
        "created_at": Utc::now().to_rfc3339(),
        "label": label.unwrap_or("manual_backup"),
        "sha256": checksum,
        "size_bytes": size_bytes,
    });
    let meta_key = format!("{}/snapshots/{}.meta.json", prefix, snapshot_id);
    s3.put_object(&meta_key, serde_json::to_vec_pretty(&meta)?, "application/json")
        .await?;

    pb.finish_with_message("MySQL snapshot uploaded to S3!");

    println!("{} Snapshot ID: {}", "✓".green().bold(), snapshot_id.bold());
    println!("{} S3 Location: s3://{}/{}", "✓".green().bold(), cfg.s3_bucket, s3_key);
    println!("{} Size: {} bytes | SHA256: {}", "✓".green().bold(), size_bytes, checksum);

    Ok(snapshot_id)
}
