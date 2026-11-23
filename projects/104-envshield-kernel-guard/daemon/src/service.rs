use crate::config::Config;
use crate::crypto;
use colored::*;
use std::fs;
use std::path::Path;
use std::process::Command;

pub struct ServiceManager;

impl ServiceManager {
    const SERVICE_NAME: &'static str = "envshield.service";
    const SERVICE_PATH: &'static str = "/etc/systemd/system/envshield.service";

    pub fn generate_service_unit(bin_path: &Path) -> String {
        format!(
            r#"[Unit]
Description=EnvShield Sovereign Kernel .env Guard & AI Agent DLP
After=network.target local-fs.target
Documentation=https://github.com/sudarshanj01/OpenSourceHub

[Service]
Type=simple
ExecStart={} watch --all
Restart=always
RestartSec=3
KillMode=process
StandardOutput=journal
StandardError=journal
CapabilityBoundingSet=CAP_SYS_ADMIN CAP_DAC_OVERRIDE
AmbientCapabilities=CAP_SYS_ADMIN

[Install]
WantedBy=multi-user.target
"#,
            bin_path.display()
        )
    }

    pub fn install_systemd(bin_path: &Path) -> Result<(), String> {
        if unsafe { libc::geteuid() != 0 } {
            return Err("Systemd service installation requires root (sudo).".to_string());
        }

        let unit_content = Self::generate_service_unit(bin_path);
        fs::write(Self::SERVICE_PATH, unit_content)
            .map_err(|e| format!("Failed to write {}: {}", Self::SERVICE_PATH, e))?;

        let _ = Command::new("systemctl").arg("daemon-reload").status();
        let status = Command::new("systemctl")
            .arg("enable")
            .arg("--now")
            .arg(Self::SERVICE_NAME)
            .status();

        match status {
            Ok(s) if s.success() => {
                println!(
                    "{} Successfully installed and started {}",
                    "✓".green().bold(),
                    Self::SERVICE_NAME.cyan()
                );
                Ok(())
            }
            _ => Err("Failed to enable and start systemd service.".to_string()),
        }
    }

    pub fn uninstall(config: &Config) -> Result<(), String> {
        println!("{}", "🔒 EnvShield Uninstallation Security Check".yellow().bold());
        print!("Enter Master Password to confirm uninstallation: ");
        let _ = std::io::Write::flush(&mut std::io::stdout());
        let entered = rpassword::read_password().map_err(|e| e.to_string())?;

        if !crypto::verify_password(&entered, &config.password_hash) {
            return Err("Access Denied: Invalid master password. Uninstallation aborted.".to_string());
        }

        println!("{} Password verified.", "✓".green());

        if Path::new(Self::SERVICE_PATH).exists() {
            let _ = Command::new("systemctl").arg("stop").arg(Self::SERVICE_NAME).status();
            let _ = Command::new("systemctl").arg("disable").arg(Self::SERVICE_NAME).status();
            let _ = fs::remove_file(Self::SERVICE_PATH);
            let _ = Command::new("systemctl").arg("daemon-reload").status();
            println!("{} Stopped and removed systemd service unit.", "✓".green());
        }

        let config_dir = Config::get_config_dir();
        if config_dir.exists() {
            let _ = fs::remove_dir_all(&config_dir);
            println!("{} Cleaned up configuration and logs at {:?}", "✓".green(), config_dir);
        }

        println!(
            "{}",
            "EnvShield has been successfully uninstalled. Your system is no longer guarded.".yellow()
        );
        Ok(())
    }

    pub fn is_service_active() -> bool {
        let output = Command::new("systemctl")
            .arg("is-active")
            .arg(Self::SERVICE_NAME)
            .output();

        if let Ok(out) = output {
            String::from_utf8_lossy(&out.stdout).trim() == "active"
        } else {
            false
        }
    }
}
