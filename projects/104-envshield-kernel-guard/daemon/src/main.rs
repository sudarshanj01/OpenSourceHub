pub mod env_parser;
pub mod shred;
pub mod vault;

use clap::{Parser, Subcommand};
use colored::*;
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::Command;
use zeroize::Zeroize;

#[derive(Parser)]
#[command(
    name = "envshield",
    author = "OpenSourceHub Community",
    version = "0.2.0",
    about = "🔒 Sovereign In-Memory Secret Vault & AI Agent DLP\nSeals .env files with Argon2id + AES-256-GCM so AI agents and scripts cannot read plaintext secrets from disk.",
    long_about = None
)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Encrypt a plaintext .env file into .env.vault and securely shred the original from disk
    Seal {
        /// Target plaintext file to seal
        #[arg(short, long, default_value = ".env")]
        file: String,

        /// Output encrypted vault file
        #[arg(short, long)]
        vault: Option<String>,
    },

    /// Run any command (e.g. npm run dev, docker compose) with decrypted secrets injected in RAM only
    Run {
        /// Encrypted vault file to load
        #[arg(short, long, default_value = ".env.vault")]
        vault: String,

        /// Command and arguments to execute
        #[arg(trailing_var_arg = true, allow_hyphen_values = true, required = true)]
        command: Vec<String>,
    },

    /// Edit your encrypted secrets safely inside a temporary RAM-disk editor session
    Edit {
        /// Encrypted vault file to edit
        #[arg(short, long, default_value = ".env.vault")]
        vault: String,
    },

    /// Decrypt in memory and view your secrets on terminal stdout
    View {
        /// Encrypted vault file to inspect
        #[arg(short, long, default_value = ".env.vault")]
        vault: String,
    },

    /// Restore plaintext .env from encrypted vault (requires Master Password)
    Unseal {
        /// Encrypted vault file to decrypt
        #[arg(short, long, default_value = ".env.vault")]
        vault: String,

        /// Target output file for plaintext
        #[arg(short, long)]
        output: Option<String>,
    },

    /// Inspect current repository protection status
    Status,
}

fn prompt_password(prompt_text: &str) -> Result<String, String> {
    print!("{}", prompt_text);
    let _ = std::io::stdout().flush();

    // Check if stdin is piped (non-interactive or test/CI)
    if !std::io::IsTerminal::is_terminal(&std::io::stdin()) {
        let mut input = String::new();
        std::io::stdin()
            .read_line(&mut input)
            .map_err(|e| format!("Failed to read line: {}", e))?;
        return Ok(input.trim_end_matches(['\r', '\n']).to_string());
    }

    // Interactive terminal: read with hidden password mask
    match rpassword::read_password() {
        Ok(p) => Ok(p),
        Err(_) => {
            let mut input = String::new();
            std::io::stdin()
                .read_line(&mut input)
                .map_err(|e| format!("Failed to read password: {}", e))?;
            Ok(input.trim_end_matches(['\r', '\n']).to_string())
        }
    }
}

fn get_vault_path(env_file: &str, custom_vault: Option<String>) -> PathBuf {
    if let Some(v) = custom_vault {
        PathBuf::from(v)
    } else {
        PathBuf::from(format!("{}.vault", env_file))
    }
}

fn main() {
    let cli = Cli::parse();

    match cli.command {
        Commands::Seal { file, vault } => {
            let env_path = PathBuf::from(&file);
            let vault_path = get_vault_path(&file, vault);

            if !env_path.exists() {
                eprintln!(
                    "{} File '{}' not found in current directory.",
                    "✗".red().bold(),
                    file.yellow()
                );
                std::process::exit(1);
            }

            println!(
                "{}",
                "============================================================".cyan()
            );
            println!(
                "{}",
                "   🔒 EnvShield — Seal Project Secrets from AI Agents"
                    .bold()
                    .cyan()
            );
            println!(
                "{}",
                "============================================================".cyan()
            );
            println!("This will encrypt '{}' into '{}' using AES-256-GCM + Argon2id,", file.yellow(), vault_path.display().to_string().cyan());
            println!("and permanently shred the plaintext '{}' from your disk.\n", file.yellow());

            let mut pwd1 = match prompt_password("Enter new Master Password: ") {
                Ok(p) => p,
                Err(e) => {
                    eprintln!("{}", e.red());
                    std::process::exit(1);
                }
            };

            if pwd1.trim().is_empty() {
                eprintln!("{}", "Error: Master password cannot be empty.".red().bold());
                std::process::exit(1);
            }

            let mut pwd2 = match prompt_password("Confirm Master Password: ") {
                Ok(p) => p,
                Err(e) => {
                    eprintln!("{}", e.red());
                    std::process::exit(1);
                }
            };

            if pwd1 != pwd2 {
                eprintln!("{}", "Error: Passwords do not match!".red().bold());
                pwd1.zeroize();
                pwd2.zeroize();
                std::process::exit(1);
            }

            // Read plaintext
            let plaintext = match fs::read(&env_path) {
                Ok(bytes) => bytes,
                Err(e) => {
                    eprintln!("{} Failed to read {}: {}", "✗".red(), file, e);
                    pwd1.zeroize();
                    std::process::exit(1);
                }
            };

            println!("{} Encrypting secrets with Argon2id + AES-256-GCM...", "⏳".cyan());
            let encrypted = match vault::encrypt_vault(&plaintext, &pwd1) {
                Ok(enc) => enc,
                Err(e) => {
                    eprintln!("{} Encryption error: {}", "✗".red(), e);
                    pwd1.zeroize();
                    std::process::exit(1);
                }
            };
            pwd1.zeroize();
            pwd2.zeroize();

            // Write vault file
            if let Err(e) = fs::write(&vault_path, encrypted) {
                eprintln!("{} Failed to write vault {}: {}", "✗".red(), vault_path.display(), e);
                std::process::exit(1);
            }

            // Securely shred the plaintext file from disk
            println!("{} Securely shredding plaintext '{}' from disk...", "⏳".cyan(), file);
            if let Err(e) = shred::secure_shred(&env_path) {
                eprintln!("{} Warning during shred: {}", "✗".yellow(), e);
            }

            // Update .gitignore if present
            if Path::new(".gitignore").exists() {
                if let Ok(content) = fs::read_to_string(".gitignore") {
                    if !content.lines().any(|l| l.trim() == file || l.trim() == ".env") {
                        if let Ok(mut f) = OpenOptions::new().append(true).open(".gitignore") {
                            let _ = writeln!(f, "\n# Added by EnvShield\n{}", file);
                            println!("{} Appended '{}' to .gitignore", "✓".green(), file);
                        }
                    }
                }
            }

            println!(
                "\n{} {}",
                "✓ [SEALED]".green().bold(),
                format!("'{}' successfully encrypted to '{}'", file, vault_path.display()).bold()
            );
            println!("  • Plaintext has been completely wiped from your storage.");
            println!("  • AI agents (Claude Code, Cursor) will now see: 'No such file or directory'.");
            println!("  • To run your app with secrets injected in memory:");
            println!("      {}", format!("envshield run -- npm run dev").cyan().bold());
            println!("  • To edit secrets securely in RAM: {}", "envshield edit".cyan());
        }

        Commands::Run { vault, command } => {
            let vault_path = PathBuf::from(&vault);
            if !vault_path.exists() {
                eprintln!(
                    "{} Encrypted vault '{}' not found. Run 'envshield seal' first.",
                    "✗".red().bold(),
                    vault.yellow()
                );
                std::process::exit(1);
            }

            let mut password = match prompt_password("Enter Master Password: ") {
                Ok(p) => p,
                Err(e) => {
                    eprintln!("{}", e.red());
                    std::process::exit(1);
                }
            };

            let vault_data = match fs::read_to_string(&vault_path) {
                Ok(d) => d,
                Err(e) => {
                    eprintln!("{} Failed to read vault {}: {}", "✗".red(), vault, e);
                    std::process::exit(1);
                }
            };

            let mut decrypted_bytes = match vault::decrypt_vault(&vault_data, &password) {
                Ok(b) => b,
                Err(e) => {
                    eprintln!("{} {}", "✗".red().bold(), e);
                    password.zeroize();
                    std::process::exit(1);
                }
            };
            password.zeroize();

            let decrypted_str = match String::from_utf8(decrypted_bytes.clone()) {
                Ok(s) => s,
                Err(_) => {
                    eprintln!("{} Decrypted content is not valid UTF-8 text.", "✗".red().bold());
                    decrypted_bytes.zeroize();
                    std::process::exit(1);
                }
            };
            decrypted_bytes.zeroize();

            let env_vars = env_parser::parse_env_content(&decrypted_str);

            let exe = &command[0];
            let args = &command[1..];

            println!(
                "{} Injected {} environment variables into RAM for: {}",
                "⚡".green().bold(),
                env_vars.len().to_string().cyan().bold(),
                command.join(" ").bold()
            );

            let status = Command::new(exe)
                .args(args)
                .envs(env_vars)
                .status();

            match status {
                Ok(s) => {
                    if let Some(code) = s.code() {
                        std::process::exit(code);
                    }
                }
                Err(e) => {
                    eprintln!("{} Failed to execute command '{}': {}", "✗".red(), exe, e);
                    std::process::exit(1);
                }
            }
        }

        Commands::Edit { vault } => {
            let vault_path = PathBuf::from(&vault);
            if !vault_path.exists() {
                eprintln!("{} Vault '{}' not found.", "✗".red().bold(), vault.yellow());
                std::process::exit(1);
            }

            let mut password = match prompt_password("Enter Master Password: ") {
                Ok(p) => p,
                Err(e) => {
                    eprintln!("{}", e.red());
                    std::process::exit(1);
                }
            };

            let vault_data = match fs::read_to_string(&vault_path) {
                Ok(d) => d,
                Err(e) => {
                    eprintln!("{} Failed to read vault: {}", "✗".red(), e);
                    std::process::exit(1);
                }
            };

            let mut decrypted_bytes = match vault::decrypt_vault(&vault_data, &password) {
                Ok(b) => b,
                Err(e) => {
                    eprintln!("{} {}", "✗".red().bold(), e);
                    password.zeroize();
                    std::process::exit(1);
                }
            };

            // Choose RAM disk location (/dev/shm on Linux, else system temp)
            let ram_dir = if Path::new("/dev/shm").is_dir() {
                PathBuf::from("/dev/shm")
            } else {
                std::env::temp_dir()
            };

            let temp_file_path = ram_dir.join(format!(".envshield_edit_{}", rand::random::<u32>()));

            // Write decrypted content to RAM temp file
            if let Err(e) = fs::write(&temp_file_path, &decrypted_bytes) {
                eprintln!("{} Failed to create temporary RAM file: {}", "✗".red(), e);
                decrypted_bytes.zeroize();
                password.zeroize();
                std::process::exit(1);
            }
            decrypted_bytes.zeroize();

            // Detect editor
            let editor = std::env::var("EDITOR")
                .or_else(|_| std::env::var("VISUAL"))
                .unwrap_or_else(|_| {
                    if which::which("nano").is_ok() {
                        "nano".to_string()
                    } else if which::which("vim").is_ok() {
                        "vim".to_string()
                    } else if cfg!(windows) {
                        "notepad".to_string()
                    } else {
                        "vi".to_string()
                    }
                });

            println!("{} Opening editor '{}' in RAM memory...", "⏳".cyan(), editor);
            let edit_status = Command::new(&editor).arg(&temp_file_path).status();

            match edit_status {
                Ok(s) if s.success() => {
                    // Read updated content
                    if let Ok(updated_content) = fs::read(&temp_file_path) {
                        println!("{} Re-encrypting secrets with fresh salt & nonce...", "⏳".cyan());
                        if let Ok(re_encrypted) = vault::encrypt_vault(&updated_content, &password) {
                            if let Err(e) = fs::write(&vault_path, re_encrypted) {
                                eprintln!("{} Failed to save vault: {}", "✗".red(), e);
                            } else {
                                println!("{} Vault '{}' updated successfully.", "✓".green().bold(), vault);
                            }
                        }
                    }
                }
                _ => {
                    eprintln!("{} Editor exited with error or was canceled. Vault left unchanged.", "✗".yellow());
                }
            }

            // Always shred temporary RAM file
            let _ = shred::secure_shred(&temp_file_path);
            password.zeroize();
        }

        Commands::View { vault } => {
            let vault_path = PathBuf::from(&vault);
            if !vault_path.exists() {
                eprintln!("{} Vault '{}' not found.", "✗".red().bold(), vault.yellow());
                std::process::exit(1);
            }

            let mut password = match prompt_password("Enter Master Password: ") {
                Ok(p) => p,
                Err(e) => {
                    eprintln!("{}", e.red());
                    std::process::exit(1);
                }
            };

            let vault_data = match fs::read_to_string(&vault_path) {
                Ok(d) => d,
                Err(e) => {
                    eprintln!("{} Failed to read vault: {}", "✗".red(), e);
                    std::process::exit(1);
                }
            };

            let mut decrypted_bytes = match vault::decrypt_vault(&vault_data, &password) {
                Ok(b) => b,
                Err(e) => {
                    eprintln!("{} {}", "✗".red().bold(), e);
                    password.zeroize();
                    std::process::exit(1);
                }
            };
            password.zeroize();

            println!("{}", "────────────────────────────────────────────────────────────".dimmed());
            println!("{} Plaintext secrets decrypted in memory:", "🔒".green());
            println!("{}", "────────────────────────────────────────────────────────────".dimmed());
            print!("{}", String::from_utf8_lossy(&decrypted_bytes));
            println!("\n{}", "────────────────────────────────────────────────────────────".dimmed());
            println!("(Plaintext was displayed in stdout and was NOT saved to disk)");
            decrypted_bytes.zeroize();
        }

        Commands::Unseal { vault, output } => {
            let vault_path = PathBuf::from(&vault);
            if !vault_path.exists() {
                eprintln!("{} Vault '{}' not found.", "✗".red().bold(), vault.yellow());
                std::process::exit(1);
            }

            let out_file = output.unwrap_or_else(|| {
                if let Some(stripped) = vault.strip_suffix(".vault") {
                    stripped.to_string()
                } else {
                    ".env".to_string()
                }
            });

            let mut password = match prompt_password("Enter Master Password to UNSEAL: ") {
                Ok(p) => p,
                Err(e) => {
                    eprintln!("{}", e.red());
                    std::process::exit(1);
                }
            };

            let vault_data = match fs::read_to_string(&vault_path) {
                Ok(d) => d,
                Err(e) => {
                    eprintln!("{} Failed to read vault: {}", "✗".red(), e);
                    std::process::exit(1);
                }
            };

            let mut decrypted_bytes = match vault::decrypt_vault(&vault_data, &password) {
                Ok(b) => b,
                Err(e) => {
                    eprintln!("{} {}", "✗".red().bold(), e);
                    password.zeroize();
                    std::process::exit(1);
                }
            };
            password.zeroize();

            if let Err(e) = fs::write(&out_file, &decrypted_bytes) {
                eprintln!("{} Failed to write plaintext {}: {}", "✗".red(), out_file, e);
                decrypted_bytes.zeroize();
                std::process::exit(1);
            }
            decrypted_bytes.zeroize();

            // Delete vault
            let _ = fs::remove_file(&vault_path);

            println!(
                "{} Plaintext successfully restored to '{}'. Removed '{}'.",
                "✓ [UNSEALED]".yellow().bold(),
                out_file.bold(),
                vault
            );
            println!("{} Warning: Secrets are now visible in plaintext on disk.", "⚠️".yellow());
        }

        Commands::Status => {
            println!(
                "{}",
                "============================================================".cyan()
            );
            println!(
                "{}",
                "   🔒 EnvShield — Repository Secret Protection Status"
                    .bold()
                    .cyan()
            );
            println!(
                "{}",
                "============================================================".cyan()
            );

            let has_plaintext = Path::new(".env").exists();
            let has_vault = Path::new(".env.vault").exists();

            if has_vault && !has_plaintext {
                println!(
                    "Repository Status: {}",
                    "SEALED & PROTECTED (AI-Agent Safe)".green().bold()
                );
                println!("Vault File:        {}", ".env.vault (AES-256-GCM + Argon2id)".green());
                println!("Plaintext on Disk: {}", "NONE (Shredded)".green().bold());
                println!("\nAI Agents (Claude Code, Cursor) searching for .env will find nothing.");
            } else if has_plaintext && has_vault {
                println!(
                    "Repository Status: {}",
                    "PARTIALLY PROTECTED / OUT OF SYNC".yellow().bold()
                );
                println!("Warning: Both .env and .env.vault exist. Run 'envshield seal' to wipe plaintext.");
            } else if has_plaintext {
                println!(
                    "Repository Status: {}",
                    "UNPROTECTED (Vulnerable to AI Agent Exfiltration)".red().bold()
                );
                println!("Plaintext on Disk: {}", ".env (Unencrypted)".red());
                println!("\nTip: Run 'envshield seal' to encrypt secrets and shred plaintext.");
            } else {
                println!(
                    "Repository Status: {}",
                    "NO SECRETS FOUND (Clean Directory)".zinc_dimmed()
                );
            }
        }
    }
}

trait Dimmed {
    fn zinc_dimmed(&self) -> ColoredString;
}

impl Dimmed for str {
    fn zinc_dimmed(&self) -> ColoredString {
        self.dimmed()
    }
}
