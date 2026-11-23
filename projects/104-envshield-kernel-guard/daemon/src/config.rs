use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Config {
    pub password_hash: String,
    pub created_at: String,
    pub prompt_timeout_sec: u64,
    pub protect_patterns: Vec<String>,
    pub auto_popup: bool,
    pub log_events: bool,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            password_hash: String::new(),
            created_at: chrono::Utc::now().to_rfc3339(),
            prompt_timeout_sec: 30,
            protect_patterns: vec![
                ".env".to_string(),
                ".env.".to_string(), // matches .env.local, .env.prod, etc.
            ],
            auto_popup: true,
            log_events: true,
        }
    }
}

impl Config {
    pub fn get_config_dir() -> PathBuf {
        let is_root = unsafe { libc::geteuid() == 0 };
        if is_root {
            PathBuf::from("/etc/envshield")
        } else if let Ok(home) = std::env::var("HOME") {
            PathBuf::from(home).join(".config").join("envshield")
        } else {
            PathBuf::from("/etc/envshield")
        }
    }

    pub fn get_config_path() -> PathBuf {
        Self::get_config_dir().join("config.json")
    }

    pub fn get_log_path() -> PathBuf {
        Self::get_config_dir().join("intercepts.log")
    }

    pub fn exists() -> bool {
        Self::get_config_path().exists()
    }

    pub fn load() -> Result<Self, String> {
        let path = Self::get_config_path();
        if !path.exists() {
            return Err(format!(
                "Config file not found at {:?}. Please run 'envshield init' first.",
                path
            ));
        }
        let data = fs::read_to_string(&path)
            .map_err(|e| format!("Failed to read config at {:?}: {}", path, e))?;
        serde_json::from_str(&data)
            .map_err(|e| format!("Invalid JSON config at {:?}: {}", path, e))
    }

    pub fn save(&self) -> Result<(), String> {
        let dir = Self::get_config_dir();
        if !dir.exists() {
            fs::create_dir_all(&dir)
                .map_err(|e| format!("Failed to create config dir {:?}: {}", dir, e))?;
        }
        let path = Self::get_config_path();
        let json = serde_json::to_string_pretty(self)
            .map_err(|e| format!("Serialization error: {}", e))?;
        fs::write(&path, json)
            .map_err(|e| format!("Failed to write config to {:?}: {}", path, e))?;
        Ok(())
    }

    pub fn is_protected_filename(&self, filename: &str) -> bool {
        // Exempt public template / example files
        if filename.ends_with(".example")
            || filename.ends_with(".template")
            || filename.ends_with(".sample")
            || filename.ends_with(".dist")
        {
            return false;
        }

        if filename == ".env" {
            return true;
        }
        if filename.starts_with(".env.") {
            return true;
        }
        if filename.ends_with(".env") {
            return true;
        }
        for pattern in &self.protect_patterns {
            if filename.contains(pattern) {
                return true;
            }
        }
        false
    }
}
