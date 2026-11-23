use std::fs;
use std::io::Read;
use std::path::Path;
use std::process::{Command, Stdio};

#[derive(Debug)]
pub struct PromptRequest<'a> {
    pub pid: i32,
    pub process_name: &'a str,
    pub target_path: &'a str,
    pub timeout_sec: u64,
}

pub struct Prompter;

impl Prompter {
    /// Attempt to retrieve active GUI environment variables (DISPLAY, WAYLAND_DISPLAY, XAUTHORITY)
    /// from the calling process or the active user session.
    pub fn get_gui_env(pid: i32) -> (Option<String>, Option<String>, Option<String>, Option<u32>) {
        let mut display = std::env::var("DISPLAY").ok();
        let mut wayland = std::env::var("WAYLAND_DISPLAY").ok();
        let mut xauth = std::env::var("XAUTHORITY").ok();
        let mut uid = None;

        // Try to read environ of the requesting process
        let env_path = format!("/proc/{}/environ", pid);
        if let Ok(mut file) = fs::File::open(&env_path) {
            let mut contents = Vec::new();
            if file.read_to_end(&mut contents).is_ok() {
                for entry in contents.split(|&b| b == 0) {
                    if let Ok(s) = std::str::from_utf8(entry) {
                        if s.starts_with("DISPLAY=") && display.is_none() {
                            display = Some(s["DISPLAY=".len()..].to_string());
                        } else if s.starts_with("WAYLAND_DISPLAY=") && wayland.is_none() {
                            wayland = Some(s["WAYLAND_DISPLAY=".len()..].to_string());
                        } else if s.starts_with("XAUTHORITY=") && xauth.is_none() {
                            xauth = Some(s["XAUTHORITY=".len()..].to_string());
                        }
                    }
                }
            }
        }

        // Try to detect UID of target file owner or logged in user
        if let Ok(metadata) = fs::metadata(format!("/proc/{}", pid)) {
            use std::os::unix::fs::MetadataExt;
            uid = Some(metadata.uid());
        }

        // If DISPLAY is still none, check standard defaults
        if display.is_none() && wayland.is_none() {
            if Path::new("/tmp/.X11-unix/X0").exists() {
                display = Some(":0".to_string());
            }
        }

        (display, wayland, xauth, uid)
    }

    /// Prompt user for the master password via GUI modal or fallback
    pub fn prompt_password(req: &PromptRequest) -> Result<String, String> {
        let (display, wayland, xauth, target_uid) = Self::get_gui_env(req.pid);

        // Check for zenity
        if let Ok(zenity_path) = which::which("zenity") {
            let dialog_text = format!(
                "🚨 Secret File Access Intercepted!\n\n\
                 ⚙️ Process: {} (PID: {})\n\
                 📁 Target: {}\n\n\
                 Enter your Master Password to authorize this access:",
                req.process_name, req.pid, req.target_path
            );

            let mut cmd = Command::new(&zenity_path);
            cmd.arg("--password")
                .arg("--title=🔒 EnvShield Security Alert")
                .arg(format!("--text={}", dialog_text))
                .arg(format!("--timeout={}", req.timeout_sec))
                .stdout(Stdio::piped())
                .stderr(Stdio::null());

            // Set GUI env vars if available
            if let Some(d) = display {
                cmd.env("DISPLAY", d);
            }
            if let Some(w) = wayland {
                cmd.env("WAYLAND_DISPLAY", w);
            }
            if let Some(x) = xauth {
                cmd.env("XAUTHORITY", x);
            }

            // If we are root and target_uid is a normal user (>= 1000), drop privs for GUI spawn
            if unsafe { libc::geteuid() == 0 } {
                if let Some(u) = target_uid {
                    if u >= 1000 {
                        // Pass XDG_RUNTIME_DIR
                        cmd.env("XDG_RUNTIME_DIR", format!("/run/user/{}", u));
                    }
                }
            }

            match cmd.output() {
                Ok(output) => {
                    if output.status.success() {
                        let entered = String::from_utf8_lossy(&output.stdout)
                            .trim_end_matches('\n')
                            .to_string();
                        if !entered.is_empty() {
                            return Ok(entered);
                        }
                    }
                    return Err("Password prompt was cancelled or timed out.".to_string());
                }
                Err(e) => {
                    eprintln!("Failed to spawn zenity dialog: {}", e);
                }
            }
        }

        // Fallback: Check kdialog
        if let Ok(kdialog_path) = which::which("kdialog") {
            let dialog_text = format!(
                "EnvShield Alert: Process '{}' (PID {}) wants to access {}. Enter password:",
                req.process_name, req.pid, req.target_path
            );

            let mut cmd = Command::new(&kdialog_path);
            cmd.arg("--password")
                .arg(dialog_text)
                .arg("--title")
                .arg("EnvShield Security Alert")
                .stdout(Stdio::piped())
                .stderr(Stdio::null());

            if let Ok(output) = cmd.output() {
                if output.status.success() {
                    let entered = String::from_utf8_lossy(&output.stdout)
                        .trim_end_matches('\n')
                        .to_string();
                    if !entered.is_empty() {
                        return Ok(entered);
                    }
                }
            }
        }

        Err("No GUI display or modal tool (zenity/kdialog) available to prompt user.".to_string())
    }
}
