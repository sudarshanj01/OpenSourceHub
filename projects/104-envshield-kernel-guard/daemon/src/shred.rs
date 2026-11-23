use rand::RngCore;
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::Path;

/// Securely overwrites a file with zeros and random noise before unlinking it
pub fn secure_shred<P: AsRef<Path>>(path: P) -> std::io::Result<()> {
    let path = path.as_ref();
    if !path.exists() {
        return Ok(());
    }

    let metadata = fs::metadata(path)?;
    let len = metadata.len() as usize;

    if len > 0 {
        let mut file = OpenOptions::new().write(true).open(path)?;

        // Pass 1: Overwrite with zeros
        let zeros = vec![0u8; len];
        file.write_all(&zeros)?;
        file.sync_all()?;

        // Pass 2: Overwrite with random bytes
        let mut random_bytes = vec![0u8; len];
        rand::thread_rng().fill_bytes(&mut random_bytes);
        file.write_all(&random_bytes)?;
        file.sync_all()?;

        // Truncate to 0 bytes
        file.set_len(0)?;
        file.sync_all()?;
    }

    // Delete file
    fs::remove_file(path)
}
