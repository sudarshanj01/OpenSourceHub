pub mod aws;
pub mod config;
pub mod engine;
pub mod spool;

use anyhow::Result;
use clap::{Parser, Subcommand};
use colored::*;
use std::path::PathBuf;

#[derive(Parser)]
#[command(name = "vaultengine")]
#[command(author = "OpenSourceHub Sovereign Team")]
#[command(version = "1.0.0")]
#[command(about = "Sovereign Database Continuous Archiving & Point-in-Time Recovery (PITR) Engine", long_about = None)]
pub struct Cli {
    #[arg(short, long, default_value = "/etc/vaultengine/config.json", global = true)]
    pub config: PathBuf,

    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand)]
pub enum Commands {
    /// Interactive guided setup wizard (detects DB, IAM role, provisions S3 bucket)
    Init {
        /// Force re-initialization even if config exists
        #[arg(short, long)]
        force: bool,
    },

    /// Run the continuous backup and transaction streaming daemon
    Daemon {
        /// Run in foreground (default) or background
        #[arg(short, long)]
        detached: bool,
    },

    /// Archive a single PostgreSQL WAL segment (invoked by archive_command)
    ArchiveWal {
        /// Path to WAL file (%p in archive_command)
        source: PathBuf,
        /// File name of WAL segment (%f in archive_command)
        filename: String,
    },

    /// Trigger an immediate, non-blocking hot physical base snapshot
    Backup {
        /// Optional label/description for this snapshot
        #[arg(short, long)]
        label: Option<String>,
    },

    /// Check system health, latest snapshot, WAL sequence, and RPO lag
    Status,

    /// Restore database to an exact historical point-in-time (second-precision)
    Restore {
        /// Target timestamp (e.g. '2026-11-21 21:00:00 UTC' or '15m ago')
        #[arg(short, long)]
        target_time: Option<String>,

        /// Destination directory for restored database cluster
        #[arg(short, long)]
        into: Option<PathBuf>,

        /// Dry-run verification without writing data
        #[arg(long)]
        dry_run: bool,
    },

    /// Validate AWS EC2 IAM role and S3 bucket connectivity
    Doctor,
}

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();

    print_banner();

    match cli.command {
        Commands::Init { force } => {
            config::run_init_wizard(&cli.config, force).await?;
        }
        Commands::Daemon { detached: _ } => {
            let cfg = config::load_config(&cli.config)?;
            println!("{} Starting VaultEngine continuous archiver daemon...", "[DAEMON]".cyan().bold());
            spool::run_daemon(&cfg).await?;
        }
        Commands::ArchiveWal { source, filename } => {
            let cfg = config::load_config(&cli.config)?;
            engine::postgres::archive_wal_segment(&cfg, &source, &filename).await?;
        }
        Commands::Backup { label } => {
            let cfg = config::load_config(&cli.config)?;
            engine::run_base_backup(&cfg, label.as_deref()).await?;
        }
        Commands::Status => {
            let cfg = config::load_config(&cli.config)?;
            engine::show_status(&cfg).await?;
        }
        Commands::Restore { target_time, into, dry_run } => {
            let cfg = config::load_config(&cli.config)?;
            engine::run_restore(&cfg, target_time, into, dry_run).await?;
        }
        Commands::Doctor => {
            aws::run_doctor().await?;
        }
    }

    Ok(())
}

fn print_banner() {
    eprintln!("{}", r#"
  ██╗   ██╗ █████╗ ██╗   ██╗██╗  ████████╗███████╗███╗   ██╗ ██████╗ ██╗███╗   ██╗███████╗
  ██║   ██║██╔══██╗██║   ██║██║  ╚══██╔══╝██╔════╝████╗  ██║██╔════╝ ██║████╗  ██║██╔════╝
  ██║   ██║███████║██║   ██║██║     ██║   █████╗  ██╔██╗ ██║██║  ███╗██║██╔██╗ ██║█████╗  
  ╚██╗ ██╔╝██╔══██║██║   ██║██║     ██║   ██╔══╝  ██║╚██╗██║██║   ██║██║██║╚██╗██║██╔══╝  
   ╚████╔╝ ██║  ██║╚██████╔╝███████╗██║   ███████╗██║ ╚████║╚██████╔╝██║██║ ╚████║███████╗
    ╚═══╝  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝   ╚══════╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝╚═╝  ╚═══╝╚══════╝
    Sovereign Continuous Database Archiving & Point-in-Time Recovery Engine
"#.bright_blue().bold());
}
