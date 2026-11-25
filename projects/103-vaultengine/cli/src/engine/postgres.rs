use crate::aws::S3Client;
use crate::config::VaultConfig;
use anyhow::{Context, Result};
use chrono::Utc;
use colored::*;
use flate2::read::{GzDecoder, GzEncoder};
use flate2::Compression;
use indicatif::{ProgressBar, ProgressStyle};
use sha2::{Digest, Sha256};
use std::fs;
use std::io::{Read, Write};
use std::path::Path;
use std::process::Command;

pub async fn archive_wal_segment(
    cfg: &VaultConfig,
    source_path: &Path,
    filename: &str,
) -> Result<()> {
    if !source_path.exists() {
        anyhow::bail!("Source WAL file does not exist: {}", source_path.display());
    }

    let raw_bytes = fs::read(source_path)
        .with_context(|| format!("Failed to read WAL file {}", source_path.display()))?;

    let compressed = gzip_compress(&raw_bytes, Compression::fast())?;
    let checksum = hex::encode(Sha256::digest(&compressed));
    let s3_key = format!("{}/wal/{}.gz", cfg.s3_prefix.trim_end_matches('/'), filename);

    let s3 = S3Client::new(
        cfg.s3_bucket.clone(),
        cfg.s3_region.clone(),
        cfg.s3_endpoint.clone(),
        cfg.use_iam_role,
    )
    .await?;

    if let Err(err) = s3.put_object(&s3_key, compressed.clone(), "application/gzip").await {
        // Spool locally for retry visibility if S3 is temporarily unreachable
        let spool_dir = Path::new("spool");
        let _ = fs::create_dir_all(spool_dir);
        let _ = fs::write(spool_dir.join(format!("{}.gz", filename)), &compressed);
        return Err(err).context("S3 PutObject failed for WAL segment (spooled locally)");
    }

    record_wal_archived(filename, &checksum, raw_bytes.len(), Utc::now().timestamp())?;
    Ok(())
}

pub async fn fetch_wal_segment(cfg: &VaultConfig, filename: &str, dest_path: &Path) -> Result<()> {
    let s3_key = format!("{}/wal/{}.gz", cfg.s3_prefix.trim_end_matches('/'), filename);
    let s3 = S3Client::new(
        cfg.s3_bucket.clone(),
        cfg.s3_region.clone(),
        cfg.s3_endpoint.clone(),
        cfg.use_iam_role,
    )
    .await?;

    let compressed = s3
        .get_object(&s3_key)
        .await
        .with_context(|| format!("WAL segment {} not found in S3 ({})", filename, s3_key))?;

    let decompressed = gzip_decompress(&compressed)?;

    if let Some(parent) = dest_path.parent() {
        fs::create_dir_all(parent)?;
    }

    let tmp_path = dest_path.with_extension("vaultengine_tmp");
    fs::write(&tmp_path, &decompressed)?;
    fs::rename(&tmp_path, dest_path)?;

    Ok(())
}

fn record_wal_archived(filename: &str, checksum: &str, raw_size: usize, timestamp: i64) -> Result<()> {
    let ledger_path = Path::new("wal_manifest.jsonl");
    let line = format!(
        "{{\"file\":\"{}\",\"sha256\":\"{}\",\"bytes\":{},\"ts\":{}}}\n",
        filename, checksum, raw_size, timestamp
    );

    let mut file = fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(ledger_path)?;
    file.write_all(line.as_bytes())?;
    Ok(())
}

pub async fn take_postgres_snapshot(cfg: &VaultConfig, label: Option<&str>) -> Result<String> {
    let timestamp = Utc::now().format("%Y%m%d_%H%M%S").to_string();
    let snapshot_id = format!("base_{}", timestamp);
    let prefix = cfg.s3_prefix.trim_end_matches('/');
    let s3_key = format!("{}/snapshots/{}.tar.gz", prefix, snapshot_id);

    println!(
        "{} Initiating hot physical snapshot for PostgreSQL: {}",
        "[BACKUP]".green().bold(),
        snapshot_id.cyan()
    );

    let pb = ProgressBar::new_spinner();
    pb.set_style(
        ProgressStyle::default_spinner()
            .template("{spinner:.green} {msg}")
            .unwrap(),
    );
    pb.set_message("Running pg_basebackup physical snapshot...");

    let temp_dir = tempfile::tempdir()?;
    let mut cmd = Command::new("pg_basebackup");
    cmd.arg("-h")
        .arg(&cfg.db_host)
        .arg("-p")
        .arg(cfg.db_port.to_string())
        .arg("-U")
        .arg(&cfg.db_user)
        .arg("-D")
        .arg(temp_dir.path())
        .arg("-Ft")
        .arg("-z")
        .arg("-X")
        .arg("fetch")
        .arg("-c")
        .arg("fast");

    if let Some(ref pw) = cfg.db_password {
        cmd.env("PGPASSWORD", pw);
    }

    let base_tar_gz: Vec<u8>;
    let wal_tar_gz: Option<Vec<u8>>;

    match cmd.output() {
        Ok(out) => {
            if !out.status.success() {
                pb.finish_and_clear();
                let stderr = String::from_utf8_lossy(&out.stderr);
                anyhow::bail!("pg_basebackup failed ({}): {}", out.status, stderr.trim());
            }
            let base_path = temp_dir.path().join("base.tar.gz");
            base_tar_gz = fs::read(&base_path)
                .with_context(|| format!("pg_basebackup did not produce {}", base_path.display()))?;

            let wal_path = temp_dir.path().join("pg_wal.tar.gz");
            wal_tar_gz = if wal_path.exists() {
                Some(fs::read(&wal_path)?)
            } else {
                None
            };
        }
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
            // Fallback: archive local data_dir directly if pg_basebackup binary is absent
            if !cfg.data_dir.exists() {
                pb.finish_and_clear();
                anyhow::bail!(
                    "pg_basebackup binary not found on PATH and data_dir {} does not exist.",
                    cfg.data_dir.display()
                );
            }
            pb.set_message("pg_basebackup not found; archiving local PGDATA directory...");
            base_tar_gz = tar_gz_directory(&cfg.data_dir)?;
            wal_tar_gz = None;
        }
        Err(e) => {
            pb.finish_and_clear();
            return Err(e).context("Failed to execute pg_basebackup");
        }
    }

    pb.set_message("Uploading compressed base snapshot to S3...");

    let s3 = S3Client::new(
        cfg.s3_bucket.clone(),
        cfg.s3_region.clone(),
        cfg.s3_endpoint.clone(),
        cfg.use_iam_role,
    )
    .await?;

    s3.ensure_bucket().await?;
    let size_bytes = base_tar_gz.len();
    let checksum = s3.put_object(&s3_key, base_tar_gz, "application/gzip").await?;

    if let Some(wal_bytes) = wal_tar_gz {
        let wal_key = format!("{}/snapshots/{}_wal.tar.gz", prefix, snapshot_id);
        s3.put_object(&wal_key, wal_bytes, "application/gzip").await?;
    }

    // Upload snapshot metadata sidecar
    let meta = serde_json::json!({
        "snapshot_id": snapshot_id,
        "engine": "postgres",
        "cluster": cfg.db_name,
        "created_at": Utc::now().to_rfc3339(),
        "label": label.unwrap_or("manual_backup"),
        "sha256": checksum,
        "size_bytes": size_bytes,
    });
    let meta_key = format!("{}/snapshots/{}.meta.json", prefix, snapshot_id);
    s3.put_object(&meta_key, serde_json::to_vec_pretty(&meta)?, "application/json")
        .await?;

    pb.finish_with_message("Snapshot successfully uploaded to S3!");

    println!("{} Snapshot ID: {}", "✓".green().bold(), snapshot_id.bold());
    println!("{} S3 Location: s3://{}/{}", "✓".green().bold(), cfg.s3_bucket, s3_key);
    println!("{} Size: {} bytes | SHA256: {}", "✓".green().bold(), size_bytes, checksum);

    Ok(snapshot_id)
}

pub fn gzip_compress(data: &[u8], level: Compression) -> Result<Vec<u8>> {
    let mut encoder = GzEncoder::new(data, level);
    let mut out = Vec::new();
    encoder.read_to_end(&mut out)?;
    Ok(out)
}

pub fn gzip_decompress(data: &[u8]) -> Result<Vec<u8>> {
    let mut decoder = GzDecoder::new(data);
    let mut out = Vec::new();
    decoder.read_to_end(&mut out)?;
    Ok(out)
}

pub fn tar_gz_directory(dir: &Path) -> Result<Vec<u8>> {
    let mut tar_buf = Vec::new();
    {
        let enc = flate2::write::GzEncoder::new(&mut tar_buf, Compression::default());
        let mut tar = tar::Builder::new(enc);
        tar.append_dir_all(".", dir)?;
        tar.finish()?;
    }
    Ok(tar_buf)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_gzip_roundtrip() {
        let original = b"VaultEngine WAL test payload 0123456789abcdef";
        let compressed = gzip_compress(original, Compression::fast()).unwrap();
        let restored = gzip_decompress(&compressed).unwrap();
        assert_eq!(original.as_slice(), restored.as_slice());
    }

    #[test]
    fn test_tar_gz_directory_roundtrip() {
        let src = tempfile::tempdir().unwrap();
        fs::write(src.path().join("PG_VERSION"), "17\n").unwrap();
        fs::create_dir_all(src.path().join("pg_wal")).unwrap();
        fs::write(src.path().join("pg_wal/000000010000000000000001"), b"waldata").unwrap();

        let archive_bytes = tar_gz_directory(src.path()).unwrap();
        assert!(!archive_bytes.is_empty());

        let dst = tempfile::tempdir().unwrap();
        let dec = GzDecoder::new(&archive_bytes[..]);
        let mut archive = tar::Archive::new(dec);
        archive.unpack(dst.path()).unwrap();

        assert_eq!(fs::read_to_string(dst.path().join("PG_VERSION")).unwrap(), "17\n");
        assert_eq!(
            fs::read(dst.path().join("pg_wal/000000010000000000000001")).unwrap(),
            b"waldata"
        );
    }
}
