pub mod env_parser;
pub mod shred;
pub mod vault;

use colored::*;
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::Command;
use zeroize::Zeroize;

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

fn execute_seal(file: &str, custom_vault: Option<String>) {
    let env_path = PathBuf::from(file);
    let vault_path = if let Some(v) = custom_vault {
        PathBuf::from(v)
    } else {
        PathBuf::from(format!("{}.vault", file))
    };

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
        "   🔒 Shield — Seal Project Secrets from AI Agents"
            .bold()
            .cyan()
    );
    println!(
        "{}",
        "============================================================".cyan()
    );
    println!(
        "Encrypting '{}' into '{}' with AES-256-GCM + Argon2id,",
        file.yellow(),
        vault_path.display().to_string().cyan()
    );
    println!("and securely shredding plaintext '{}' from disk.\n", file.yellow());

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

    if let Err(e) = fs::write(&vault_path, encrypted) {
        eprintln!("{} Failed to write vault {}: {}", "✗".red(), vault_path.display(), e);
        std::process::exit(1);
    }

    println!("{} Securely shredding plaintext '{}' from disk...", "⏳".cyan(), file);
    if let Err(e) = shred::secure_shred(&env_path) {
        eprintln!("{} Warning during shred: {}", "✗".yellow(), e);
    }

    if Path::new(".gitignore").exists() {
        if let Ok(content) = fs::read_to_string(".gitignore") {
            if !content.lines().any(|l| l.trim() == file || l.trim() == ".env") {
                if let Ok(mut f) = OpenOptions::new().append(true).open(".gitignore") {
                    let _ = writeln!(f, "\n# Added by Shield\n{}", file);
                    println!("{} Appended '{}' to .gitignore", "✓".green(), file);
                }
            }
        }
    }

    println!(
        "\n{} {}",
        "✓ [SEALED]".green().bold(),
        format!("'{}' is now locked inside '{}'", file, vault_path.display()).bold()
    );
    println!("  • Plaintext has been completely wiped from your storage.");
    println!("  • AI agents (Claude Code, Cursor) will now see: 'No such file or directory'.");
    println!("  • To run commands with secrets in RAM:");
    println!("      {}", "shield npm run dev".cyan().bold());
    println!("      {}", "shield python app.py".cyan().bold());
    println!("  • To edit secrets in RAM: {}", "shield edit".cyan());
}

fn execute_run(vault_file: &str, command: &[String]) {
    let vault_path = PathBuf::from(vault_file);
    if !vault_path.exists() {
        eprintln!(
            "{} Encrypted vault '{}' not found in current directory.",
            "✗".red().bold(),
            vault_file.yellow()
        );
        eprintln!("Run 'shield seal' first to encrypt your .env file.");
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
            eprintln!("{} Failed to read vault {}: {}", "✗".red(), vault_file, e);
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

    // Special smart convenience: If user runs "shield cat .env"
    if command.len() >= 2 && command[0] == "cat" && (command[1] == ".env" || command[1].ends_with(".env")) {
        println!("{}", "────────────────────────────────────────────────────────────".dimmed());
        println!("{} [RAM ONLY] Decrypted .env contents:", "🔒".green());
        println!("{}", "────────────────────────────────────────────────────────────".dimmed());
        print!("{}", decrypted_str);
        println!("\n{}", "────────────────────────────────────────────────────────────".dimmed());
        return;
    }

    let env_vars = env_parser::parse_env_content(&decrypted_str);

    let exe = &command[0];
    let args = &command[1..];

    println!(
        "{} Injected {} secrets into RAM for: {}",
        "⚡".green().bold(),
        env_vars.len().to_string().cyan().bold(),
        command.join(" ").bold()
    );

    let mut cmd = Command::new(exe);
    cmd.args(args).envs(env_vars);

    #[cfg(target_os = "linux")]
    unsafe {
        use std::os::unix::process::CommandExt;
        cmd.pre_exec(|| {
            libc::prctl(libc::PR_SET_DUMPABLE, 0, 0, 0, 0);
            Ok(())
        });
    }

    let status = cmd.status();

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

fn execute_edit(vault_file: &str) {
    let vault_path = PathBuf::from(vault_file);
    if !vault_path.exists() {
        eprintln!("{} Vault '{}' not found.", "✗".red().bold(), vault_file.yellow());
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

    let ram_dir = if Path::new("/dev/shm").is_dir() {
        PathBuf::from("/dev/shm")
    } else {
        std::env::temp_dir()
    };

    let temp_file_path = ram_dir.join(format!(".shield_edit_{}", rand::random::<u32>()));

    if let Err(e) = fs::write(&temp_file_path, &decrypted_bytes) {
        eprintln!("{} Failed to create temporary RAM file: {}", "✗".red(), e);
        decrypted_bytes.zeroize();
        password.zeroize();
        std::process::exit(1);
    }
    decrypted_bytes.zeroize();

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
            if let Ok(updated_content) = fs::read(&temp_file_path) {
                println!("{} Re-encrypting secrets with fresh salt & nonce...", "⏳".cyan());
                if let Ok(re_encrypted) = vault::encrypt_vault(&updated_content, &password) {
                    if let Err(e) = fs::write(&vault_path, re_encrypted) {
                        eprintln!("{} Failed to save vault: {}", "✗".red(), e);
                    } else {
                        println!("{} Vault '{}' updated successfully in RAM.", "✓".green().bold(), vault_file);
                    }
                }
            }
        }
        _ => {
            eprintln!("{} Editor exited with error or was canceled. Vault left unchanged.", "✗".yellow());
        }
    }

    let _ = shred::secure_shred(&temp_file_path);
    password.zeroize();
}

fn execute_view(vault_file: &str) {
    let vault_path = PathBuf::from(vault_file);
    if !vault_path.exists() {
        eprintln!("{} Vault '{}' not found.", "✗".red().bold(), vault_file.yellow());
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

fn execute_unseal(vault_file: &str, output: Option<String>) {
    let vault_path = PathBuf::from(vault_file);
    if !vault_path.exists() {
        eprintln!("{} Vault '{}' not found.", "✗".red().bold(), vault_file.yellow());
        std::process::exit(1);
    }

    let out_file = output.unwrap_or_else(|| {
        if let Some(stripped) = vault_file.strip_suffix(".vault") {
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

    let _ = fs::remove_file(&vault_path);

    println!(
        "{} Plaintext successfully restored to '{}'. Removed '{}'.",
        "✓ [UNSEALED]".yellow().bold(),
        out_file.bold(),
        vault_file
    );
    println!("{} Warning: Secrets are now visible in plaintext on disk.", "⚠️".yellow());
}

fn execute_status() {
    println!(
        "{}",
        "============================================================".cyan()
    );
    println!(
        "{}",
        "   🔒 Shield — Repository Secret Protection Status"
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
        println!("Warning: Both .env and .env.vault exist. Run 'shield seal' to wipe plaintext.");
    } else if has_plaintext {
        println!(
            "Repository Status: {}",
            "UNPROTECTED (Vulnerable to AI Agent Exfiltration)".red().bold()
        );
        println!("Plaintext on Disk: {}", ".env (Unencrypted)".red());
        println!("\nTip: Run 'shield seal' to encrypt secrets and shred plaintext.");
    } else {
        println!(
            "Repository Status: {}",
            "NO SECRETS FOUND (Clean Directory)".dimmed()
        );
    }
}

fn print_help() {
    println!(
        "{}",
        "🔒 Shield — Sovereign In-Memory Secret Vault & AI Agent DLP"
            .bold()
            .cyan()
    );
    println!("Seals .env files with Argon2id + AES-256-GCM so AI agents and scripts cannot read plaintext secrets.\n");
    println!("{}", "USAGE:".bold());
    println!("  shield <COMMAND>            (Run any command with secrets injected into RAM)");
    println!("  shield seal                 (Encrypt .env into .env.vault & shred plaintext)");
    println!("  shield edit                 (Edit secrets safely in temporary RAM)");
    println!("  shield view                 (View secrets on terminal stdout)");
    println!("  shield unseal               (Restore plaintext .env from encrypted vault)");
    println!("  shield status               (Inspect current directory protection status)\n");
    println!("{}", "EXAMPLES:".bold());
    println!("  shield npm run dev          (Runs Next.js/Node with secrets in RAM)");
    println!("  shield python main.py       (Runs Python with secrets in RAM)");
    println!("  shield docker compose up    (Runs Docker with secrets in RAM)");
    println!("  shield cat .env             (Safely prints decrypted .env in memory)");
}

fn main() {
    let args: Vec<String> = std::env::args().collect();

    if args.len() < 2 {
        print_help();
        return;
    }

    let first = &args[1];

    match first.as_str() {
        "seal" => {
            let file = args.get(2).map(|s| s.as_str()).unwrap_or(".env");
            execute_seal(file, None);
        }
        "unseal" => {
            let vault = args.get(2).map(|s| s.as_str()).unwrap_or(".env.vault");
            execute_unseal(vault, None);
        }
        "edit" => {
            let vault = args.get(2).map(|s| s.as_str()).unwrap_or(".env.vault");
            execute_edit(vault);
        }
        "view" => {
            let vault = args.get(2).map(|s| s.as_str()).unwrap_or(".env.vault");
            execute_view(vault);
        }
        "status" => {
            execute_status();
        }
        "help" | "--help" | "-h" => {
            print_help();
        }
        "version" | "--version" | "-V" => {
            println!("shield 0.3.0 (OpenSourceHub)");
        }
        "run" => {
            // Support legacy "shield run -- npm run dev" or "shield run npm run dev"
            let cmd_args: Vec<String> = args[2..]
                .iter()
                .filter(|&a| a != "--")
                .cloned()
                .collect();

            if cmd_args.is_empty() {
                eprintln!("{}", "Error: No command specified to run.".red().bold());
                std::process::exit(1);
            }
            execute_run(".env.vault", &cmd_args);
        }
        _ => {
            // Natural syntax! Any command passed to shield is directly executed with RAM secrets!
            // E.g.: shield npm run dev
            //       shield python main.py
            //       shield cat .env
            let cmd_args: Vec<String> = args[1..].to_vec();
            execute_run(".env.vault", &cmd_args);
        }
    }
}
