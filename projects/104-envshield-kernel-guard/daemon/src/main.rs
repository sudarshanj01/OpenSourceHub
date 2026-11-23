pub mod config;
pub mod crypto;
pub mod fanotify;
pub mod prompt;
pub mod service;

use clap::{Parser, Subcommand};
use colored::*;
use config::Config;
use fanotify::FanotifyEngine;
use service::ServiceManager;
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};

#[derive(Parser)]
#[command(
    name = "envshield",
    author = "OpenSourceHub Community",
    version = "0.1.0",
    about = "🔒 Sovereign Kernel-Level .env Guard & AI Agent DLP\nIntercepts all .env access attempts at the Linux kernel level and prompts for a master password.",
    long_about = None
)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Initialize EnvShield master password and configuration
    Init {
        #[arg(short, long)]
        install_service: bool,
    },

    /// Start the real-time kernel guard fanotify monitoring engine
    Watch {
        /// Path or mount point to monitor (default: /)
        #[arg(short, long, default_value = "/")]
        path: String,

        /// Intercept across the entire filesystem
        #[arg(short, long)]
        all: bool,
    },

    /// Check protection status, active service, and recent intercepted access attempts
    Status,

    /// Scan a directory or project tree to locate all .env files guarded by EnvShield
    Scan {
        #[arg(short, long, default_value = ".")]
        path: String,
    },

    /// Safely uninstall EnvShield (requires master password verification)
    Uninstall,
}

fn main() {
    let cli = Cli::parse();

    match cli.command {
        Commands::Init { install_service } => {
            println!(
                "{}",
                "============================================================"
                    .cyan()
            );
            println!(
                "{}",
                "   🔒 EnvShield — Sovereign Kernel .env Guard Setup"
                    .bold()
                    .cyan()
            );
            println!(
                "{}",
                "============================================================"
                    .cyan()
            );
            println!("This will establish your master password. No process, user, script,");
            println!("or AI agent (Claude, Cursor, Aider) will be permitted to access");
            println!("any .env file without entering this password.\n");

            print!("Enter new Master Password: ");
            let _ = std::io::stdout().flush();
            let pwd1 = match rpassword::read_password() {
                Ok(p) => p,
                Err(e) => {
                    eprintln!("Failed to read password: {}", e);
                    std::process::exit(1);
                }
            };

            if pwd1.trim().is_empty() {
                eprintln!("{}", "Error: Master password cannot be empty.".red().bold());
                std::process::exit(1);
            }

            print!("Confirm Master Password: ");
            let _ = std::io::stdout().flush();
            let pwd2 = match rpassword::read_password() {
                Ok(p) => p,
                Err(e) => {
                    eprintln!("Failed to read password: {}", e);
                    std::process::exit(1);
                }
            };

            if pwd1 != pwd2 {
                eprintln!("{}", "Error: Passwords do not match!".red().bold());
                std::process::exit(1);
            }

            println!("{} Hashing master password with Argon2id...", "⏳".cyan());
            let hash = match crypto::hash_password(&pwd1) {
                Ok(h) => h,
                Err(e) => {
                    eprintln!("Hashing failed: {}", e);
                    std::process::exit(1);
                }
            };

            let mut config = Config::default();
            config.password_hash = hash;

            if let Err(e) = config.save() {
                eprintln!("{} Failed to save config: {}", "✗".red(), e);
                std::process::exit(1);
            }

            println!(
                "{} Master password configured securely at {:?}",
                "✓".green().bold(),
                Config::get_config_path()
            );

            if install_service {
                if let Ok(current_exe) = std::env::current_exe() {
                    match ServiceManager::install_systemd(&current_exe) {
                        Ok(_) => println!("{} Systemd daemon enabled and active.", "✓".green()),
                        Err(e) => eprintln!("{} Service installation failed: {}", "✗".yellow(), e),
                    }
                }
            } else {
                println!("\nTo start protecting your system immediately, run:");
                println!("  sudo envshield watch --all");
            }
        }

        Commands::Watch { path, all } => {
            let config = match Config::load() {
                Ok(c) => c,
                Err(e) => {
                    eprintln!("{} {}", "✗".red().bold(), e);
                    std::process::exit(1);
                }
            };

            let watch_target = if all { "/" } else { &path };

            let mut engine = match FanotifyEngine::new(config) {
                Ok(e) => e,
                Err(e) => {
                    eprintln!("{} {}", "✗".red().bold(), e);
                    eprintln!("\nTip: fanotify requires root privileges. Please run with 'sudo envshield watch'.");
                    std::process::exit(1);
                }
            };

            if let Err(e) = engine.add_watch_path(watch_target) {
                eprintln!("{} {}", "✗".red().bold(), e);
                std::process::exit(1);
            }

            if let Err(e) = engine.run_loop() {
                eprintln!("{} Engine stopped with error: {}", "✗".red(), e);
            }
        }

        Commands::Status => {
            println!(
                "{}",
                "============================================================"
                    .cyan()
            );
            println!(
                "{}",
                "   🔒 EnvShield Kernel Guard — System Status"
                    .bold()
                    .cyan()
            );
            println!(
                "{}",
                "============================================================"
                    .cyan()
            );

            let config_exists = Config::exists();
            println!(
                "Config Status:    {}",
                if config_exists {
                    "CONFIGURED".green().bold()
                } else {
                    "NOT INITIALIZED (run 'envshield init')".yellow()
                }
            );
            println!("Config Path:      {:?}", Config::get_config_path());

            let service_active = ServiceManager::is_service_active();
            println!(
                "Systemd Daemon:   {}",
                if service_active {
                    "RUNNING (ACTIVE)".green().bold()
                } else {
                    "INACTIVE (use 'sudo envshield watch' or install service)".yellow()
                }
            );

            let log_path = Config::get_log_path();
            println!("Audit Log Path:   {:?}", log_path);

            if log_path.exists() {
                if let Ok(content) = fs::read_to_string(&log_path) {
                    let lines: Vec<&str> = content.lines().collect();
                    println!("\nRecent Intercepted Events (Last 10):");
                    if lines.is_empty() {
                        println!("  (No events recorded yet)");
                    } else {
                        for line in lines.iter().rev().take(10) {
                            if line.contains("[ALLOW]") {
                                println!("  {}", line.green());
                            } else if line.contains("[DENY]") {
                                println!("  {}", line.red().bold());
                            } else {
                                println!("  {}", line);
                            }
                        }
                    }
                }
            }
        }

        Commands::Scan { path } => {
            println!(
                "Scanning {:?} for guarded .env files...",
                Path::new(&path).canonicalize().unwrap_or(PathBuf::from(&path))
            );

            let config = Config::load().unwrap_or_default();
            let mut found = 0;

            fn visit_dirs(
                dir: &Path,
                config: &Config,
                found: &mut usize,
            ) -> std::io::Result<()> {
                if dir.is_dir() {
                    // Skip .git to avoid clutter
                    if dir.file_name().and_then(|n| n.to_str()) == Some(".git") {
                        return Ok(());
                    }
                    if let Ok(entries) = fs::read_dir(dir) {
                        for entry in entries.flatten() {
                            let p = entry.path();
                            if p.is_dir() {
                                let _ = visit_dirs(&p, config, found);
                            } else if let Some(fname) = p.file_name().and_then(|n| n.to_str()) {
                                if config.is_protected_filename(fname) {
                                    *found += 1;
                                    println!("  {} {}", "🔒 [GUARDED]".green().bold(), p.display());
                                }
                            }
                        }
                    }
                }
                Ok(())
            }

            let _ = visit_dirs(Path::new(&path), &config, &mut found);
            println!("\nTotal guarded files found: {}", found.to_string().cyan().bold());
        }

        Commands::Uninstall => {
            let config = match Config::load() {
                Ok(c) => c,
                Err(e) => {
                    eprintln!("{} Cannot uninstall: {}", "✗".red(), e);
                    std::process::exit(1);
                }
            };

            if let Err(e) = ServiceManager::uninstall(&config) {
                eprintln!("{} {}", "✗".red().bold(), e);
                std::process::exit(1);
            }
        }
    }
}
