use crate::aws::S3Client;
use crate::config::VaultConfig;
use crate::engine::postgres::gzip_compress;
use anyhow::{Context, Result};
use chrono::Utc;
use colored::*;
use flate2::Compression;
use indicatif::{ProgressBar, ProgressStyle};
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

pub fn is_binlog_filename(name: &str) -> bool {
    if name.ends_with(".index") {
        return false;
    }
    if let Some((prefix, ext)) = name.rsplit_once('.') {
        let is_binlog_prefix = prefix.ends_with("-bin") || prefix == "binlog";
        let is_numeric_ext = !ext.is_empty() && ext.bytes().all(|b| b.is_ascii_digit());
        return is_binlog_prefix && is_numeric_ext;
    }
    false
}

pub fn list_binlog_files(data_dir: &Path) -> Result<Vec<(String, PathBuf, u64)>> {
    if !data_dir.exists() {
        return Ok(Vec::new());
    }
    let mut files = Vec::new();
    for entry in fs::read_dir(data_dir)? {
        let entry = entry?;
        let path = entry.path();
        if !path.is_file() {
            continue;
        }
        if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
            if is_binlog_filename(name) {
                let len = entry.metadata()?.len();
                files.push((name.to_string(), path, len));
            }
        }
    }
    files.sort_by(|a, b| a.0.cmp(&b.0));
    Ok(files)
}

pub async fn sync_mysql_binlogs(
    cfg: &VaultConfig,
    uploaded_sizes: &mut HashMap<String, u64>,
) -> Result<usize> {
    let files = list_binlog_files(&cfg.data_dir)?;
    let mut synced = 0usize;

    for (name, path, len) in files {
        let prev_len = uploaded_sizes.get(&name).copied();
        if prev_len == Some(len) {
            continue;
        }
        archive_binlog_segment(cfg, &path, &name).await?;
        uploaded_sizes.insert(name, len);
        synced += 1;
    }

    Ok(synced)
}

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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_binlog_filename() {
        assert!(is_binlog_filename("mysql-bin.000001"));
        assert!(is_binlog_filename("binlog.000042"));
        assert!(!is_binlog_filename("mysql-bin.index"));
        assert!(!is_binlog_filename("ibdata1"));
        assert!(!is_binlog_filename("auto.cnf"));
    }

    #[test]
    fn test_list_binlog_files() {
        let dir = tempfile::tempdir().unwrap();
        fs::write(dir.path().join("mysql-bin.000002"), b"bin2").unwrap();
        fs::write(dir.path().join("mysql-bin.000001"), b"bin1").unwrap();
        fs::write(dir.path().join("mysql-bin.index"), b"idx").unwrap();
        fs::write(dir.path().join("ibdata1"), b"ib").unwrap();

        let files = list_binlog_files(dir.path()).unwrap();
        assert_eq!(files.len(), 2);
        assert_eq!(files[0].0, "mysql-bin.000001");
        assert_eq!(files[1].0, "mysql-bin.000002");
    }
}
