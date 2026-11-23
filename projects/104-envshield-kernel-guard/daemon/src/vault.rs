use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use argon2::Argon2;
use rand::RngCore;
use std::fmt;

const MAGIC_HEADER: &str = "ENVSHIELD_V1";
const SALT_LEN: usize = 16;
const NONCE_LEN: usize = 12;

#[derive(Debug)]
pub enum VaultError {
    InvalidHeader,
    CorruptedData,
    DecryptionFailed,
    CryptoError(String),
}

impl fmt::Display for VaultError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            VaultError::InvalidHeader => write!(f, "Invalid vault format: missing header"),
            VaultError::CorruptedData => write!(f, "Corrupted vault payload"),
            VaultError::DecryptionFailed => write!(f, "Access Denied: Incorrect Master Password"),
            VaultError::CryptoError(e) => write!(f, "Cryptographic error: {}", e),
        }
    }
}

impl std::error::Error for VaultError {}

/// Derives a 256-bit key using Argon2id with memory-hard parameters
fn derive_key(password: &str, salt: &[u8]) -> Result<[u8; 32], VaultError> {
    let mut key = [0u8; 32];
    Argon2::default()
        .hash_password_into(password.as_bytes(), salt, &mut key)
        .map_err(|e| VaultError::CryptoError(e.to_string()))?;
    Ok(key)
}

/// Encrypts plaintext bytes using Argon2id + AES-256-GCM
pub fn encrypt_vault(plaintext: &[u8], password: &str) -> Result<String, VaultError> {
    let mut salt = [0u8; SALT_LEN];
    rand::thread_rng().fill_bytes(&mut salt);

    let mut nonce_bytes = [0u8; NONCE_LEN];
    rand::thread_rng().fill_bytes(&mut nonce_bytes);

    let key = derive_key(password, &salt)?;
    let cipher = Aes256Gcm::new_from_slice(&key)
        .map_err(|e| VaultError::CryptoError(e.to_string()))?;

    let nonce = Nonce::from_slice(&nonce_bytes);
    let ciphertext = cipher
        .encrypt(nonce, plaintext)
        .map_err(|e| VaultError::CryptoError(e.to_string()))?;

    // Combine: salt (16B) + nonce (12B) + ciphertext
    let mut payload = Vec::with_capacity(SALT_LEN + NONCE_LEN + ciphertext.len());
    payload.extend_from_slice(&salt);
    payload.extend_from_slice(&nonce_bytes);
    payload.extend_from_slice(&ciphertext);

    let base64_payload = base64_encode(&payload);
    Ok(format!("{}\n{}", MAGIC_HEADER, base64_payload))
}

/// Decrypts vault content using Argon2id + AES-256-GCM
pub fn decrypt_vault(vault_data: &str, password: &str) -> Result<Vec<u8>, VaultError> {
    let lines: Vec<&str> = vault_data.lines().filter(|l| !l.trim().is_empty()).collect();
    if lines.is_empty() || lines[0] != MAGIC_HEADER {
        return Err(VaultError::InvalidHeader);
    }

    if lines.len() < 2 {
        return Err(VaultError::CorruptedData);
    }

    let payload = base64_decode(lines[1]).map_err(|_| VaultError::CorruptedData)?;
    if payload.len() < SALT_LEN + NONCE_LEN {
        return Err(VaultError::CorruptedData);
    }

    let salt = &payload[..SALT_LEN];
    let nonce_bytes = &payload[SALT_LEN..SALT_LEN + NONCE_LEN];
    let ciphertext = &payload[SALT_LEN + NONCE_LEN..];

    let key = derive_key(password, salt)?;
    let cipher = Aes256Gcm::new_from_slice(&key)
        .map_err(|e| VaultError::CryptoError(e.to_string()))?;

    let nonce = Nonce::from_slice(nonce_bytes);
    let plaintext = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|_| VaultError::DecryptionFailed)?;

    Ok(plaintext)
}

// Simple standard base64 encode/decode without external dependency
const B64_CHARS: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

fn base64_encode(data: &[u8]) -> String {
    let mut result = String::with_capacity((data.len() + 2) / 3 * 4);
    for chunk in data.chunks(3) {
        let b0 = chunk[0];
        let b1 = if chunk.len() > 1 { chunk[1] } else { 0 };
        let b2 = if chunk.len() > 2 { chunk[2] } else { 0 };

        result.push(B64_CHARS[(b0 >> 2) as usize] as char);
        result.push(B64_CHARS[(((b0 & 0x03) << 4) | (b1 >> 4)) as usize] as char);

        if chunk.len() > 1 {
            result.push(B64_CHARS[(((b1 & 0x0F) << 2) | (b2 >> 6)) as usize] as char);
        } else {
            result.push('=');
        }

        if chunk.len() > 2 {
            result.push(B64_CHARS[(b2 & 0x3F) as usize] as char);
        } else {
            result.push('=');
        }
    }
    result
}

fn base64_decode(input: &str) -> Result<Vec<u8>, ()> {
    let mut decode_table = [255u8; 256];
    for (i, &c) in B64_CHARS.iter().enumerate() {
        decode_table[c as usize] = i as u8;
    }

    let clean = input.trim();
    let mut output = Vec::with_capacity(clean.len() * 3 / 4);
    let bytes = clean.as_bytes();

    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == b'\n' || bytes[i] == b'\r' || bytes[i] == b' ' {
            i += 1;
            continue;
        }

        if i + 4 > bytes.len() {
            return Err(());
        }

        let c0 = bytes[i];
        let c1 = bytes[i + 1];
        let c2 = bytes[i + 2];
        let c3 = bytes[i + 3];

        let v0 = decode_table[c0 as usize];
        let v1 = decode_table[c1 as usize];

        if v0 == 255 || v1 == 255 {
            return Err(());
        }

        output.push((v0 << 2) | (v1 >> 4));

        if c2 != b'=' {
            let v2 = decode_table[c2 as usize];
            if v2 == 255 {
                return Err(());
            }
            output.push(((v1 & 0x0F) << 4) | (v2 >> 2));

            if c3 != b'=' {
                let v3 = decode_table[c3 as usize];
                if v3 == 255 {
                    return Err(());
                }
                output.push(((v2 & 0x03) << 6) | v3);
            }
        }

        i += 4;
    }

    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_vault_roundtrip() {
        let plaintext = b"DATABASE_URL=postgres://localhost:5432/db\nAPI_KEY=sk_test_secret_12345";
        let password = "super_secure_master_password_99!";

        let encrypted = encrypt_vault(plaintext, password).expect("encryption failed");
        assert!(encrypted.starts_with(MAGIC_HEADER));

        let decrypted = decrypt_vault(&encrypted, password).expect("decryption failed");
        assert_eq!(plaintext.to_vec(), decrypted);

        // Wrong password test
        let wrong_result = decrypt_vault(&encrypted, "wrong_password");
        assert!(matches!(wrong_result, Err(VaultError::DecryptionFailed)));
    }
}
