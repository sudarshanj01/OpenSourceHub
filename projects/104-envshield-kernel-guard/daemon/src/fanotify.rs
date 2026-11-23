use crate::config::Config;
use crate::crypto;
use crate::prompt::{PromptRequest, Prompter};
use colored::*;
use std::collections::HashSet;
use std::ffi::CString;
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::Path;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

// Linux fanotify kernel constants
pub const FAN_CLOEXEC: libc::c_uint = 0x00000001;
pub const FAN_CLASS_CONTENT: libc::c_uint = 0x00000004;
pub const FAN_OPEN_PERM: libc::c_ulonglong = 0x00010000;
pub const FAN_MARK_ADD: libc::c_uint = 0x00000001;
pub const FAN_MARK_MOUNT: libc::c_uint = 0x00000010;
pub const FAN_MARK_FILESYSTEM: libc::c_uint = 0x00000100;

pub const FAN_ALLOW: u32 = 0x01;
pub const FAN_DENY: u32 = 0x02;

#[repr(C)]
struct FanotifyResponse {
    fd: i32,
    response: u32,
}

pub struct FanotifyEngine {
    config: Config,
    fan_fd: i32,
    running: Arc<AtomicBool>,
    authorized_pids: HashSet<i32>,
}

impl FanotifyEngine {
    pub fn new(config: Config) -> Result<Self, String> {
        // Initialize fanotify with content class (required for permission checks)
        let fan_fd = unsafe {
            libc::fanotify_init(
                FAN_CLOEXEC | FAN_CLASS_CONTENT,
                libc::O_RDONLY as libc::c_uint | libc::O_LARGEFILE as libc::c_uint,
            )
        };

        if fan_fd < 0 {
            let err = std::io::Error::last_os_error();
            return Err(format!(
                "Failed to initialize fanotify (errno: {}). Ensure you are running as root or have CAP_SYS_ADMIN: {}",
                err.raw_os_error().unwrap_or(0),
                err
            ));
        }

        Ok(Self {
            config,
            fan_fd,
            running: Arc::new(AtomicBool::new(true)),
            authorized_pids: HashSet::new(),
        })
    }

    /// Mark the target mount or filesystem path to intercept FAN_OPEN_PERM events
    pub fn add_watch_path<P: AsRef<Path>>(&self, path: P) -> Result<(), String> {
        let path_ref = path.as_ref();
        let path_str = path_ref
            .to_str()
            .ok_or_else(|| "Invalid UTF-8 in watch path".to_string())?;

        let c_path = CString::new(path_str).map_err(|e| e.to_string())?;

        // First attempt using FAN_MARK_FILESYSTEM (covers entire filesystem device)
        let mut mark_res = unsafe {
            libc::fanotify_mark(
                self.fan_fd,
                FAN_MARK_ADD | FAN_MARK_FILESYSTEM,
                FAN_OPEN_PERM,
                libc::AT_FDCWD,
                c_path.as_ptr(),
            )
        };

        // If filesystem mark is unsupported or fails, fall back to mount mark
        if mark_res < 0 {
            mark_res = unsafe {
                libc::fanotify_mark(
                    self.fan_fd,
                    FAN_MARK_ADD | FAN_MARK_MOUNT,
                    FAN_OPEN_PERM,
                    libc::AT_FDCWD,
                    c_path.as_ptr(),
                )
            };
        }

        if mark_res < 0 {
            let err = std::io::Error::last_os_error();
            return Err(format!(
                "Failed to mark path '{}' for fanotify: {}",
                path_str, err
            ));
        }

        println!(
            "{} Protected mount/filesystem point: {}",
            "✓".green().bold(),
            path_str.cyan()
        );
        Ok(())
    }

    /// Get process name and command line from /proc
    fn get_process_info(pid: i32) -> (String, String) {
        let comm_path = format!("/proc/{}/comm", pid);
        let comm = fs::read_to_string(&comm_path)
            .unwrap_or_else(|_| "unknown".to_string())
            .trim()
            .to_string();

        let cmdline_path = format!("/proc/{}/cmdline", pid);
        let cmdline = fs::read(&cmdline_path)
            .map(|bytes| {
                bytes
                    .split(|&b| b == 0)
                    .filter_map(|s| std::str::from_utf8(s).ok())
                    .collect::<Vec<_>>()
                    .join(" ")
            })
            .unwrap_or_else(|_| comm.clone());

        (comm, cmdline)
    }

    /// Log interception events to the dedicated log file
    fn log_event(&self, status: &str, pid: i32, comm: &str, path: &str) {
        if !self.config.log_events {
            return;
        }
        let log_file = Config::get_log_path();
        if let Ok(mut f) = OpenOptions::new().create(true).append(true).open(&log_file) {
            let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S");
            let _ = writeln!(f, "[{}] [{}] PID: {} ({}) -> {}", now, status, pid, comm, path);
        }
    }

    /// Send verdict (FAN_ALLOW or FAN_DENY) to the Linux kernel
    fn respond(&self, fd: i32, response_val: u32) {
        let resp = FanotifyResponse {
            fd,
            response: response_val,
        };
        let res = unsafe {
            libc::write(
                self.fan_fd,
                &resp as *const FanotifyResponse as *const libc::c_void,
                std::mem::size_of::<FanotifyResponse>(),
            )
        };
        if res < 0 {
            let err = std::io::Error::last_os_error();
            eprintln!("Failed to write fanotify response to kernel: {}", err);
        }
    }

    /// Run the synchronous kernel event loop
    pub fn run_loop(&mut self) -> Result<(), String> {
        let running = self.running.clone();
        let mut buffer = [0u8; 8192];

        println!(
            "{}",
            "🔒 EnvShield Kernel Guard is ACTIVE. Intercepting all .env access attempts..."
                .green()
                .bold()
        );
        println!(
            "Config: timeout={}s, auto_popup={}, patterns={:?}",
            self.config.prompt_timeout_sec,
            self.config.auto_popup,
            self.config.protect_patterns
        );

        while running.load(Ordering::SeqCst) {
            let len = unsafe {
                libc::read(
                    self.fan_fd,
                    buffer.as_mut_ptr() as *mut libc::c_void,
                    buffer.len(),
                )
            };

            if len < 0 {
                let err = std::io::Error::last_os_error();
                if err.kind() == std::io::ErrorKind::Interrupted {
                    continue;
                }
                eprintln!("Fanotify read error: {}", err);
                break;
            }

            let mut offset = 0;
            while offset < len as usize {
                unsafe {
                    let metadata =
                        &*(buffer.as_ptr().add(offset) as *const libc::fanotify_event_metadata);

                    if metadata.vers != libc::FANOTIFY_METADATA_VERSION {
                        eprintln!("Mismatched fanotify metadata version");
                        break;
                    }

                    if (metadata.mask & FAN_OPEN_PERM) != 0 && metadata.fd >= 0 {
                        let fd = metadata.fd;
                        let pid = metadata.pid;

                        // Resolve target path via /proc/self/fd/<fd>
                        let proc_fd_path = format!("/proc/self/fd/{}", fd);
                        let target_path = fs::read_link(&proc_fd_path).ok();

                        let is_protected = if let Some(ref path) = target_path {
                            if let Some(file_name) = path.file_name().and_then(|n| n.to_str()) {
                                self.config.is_protected_filename(file_name)
                            } else {
                                false
                            }
                        } else {
                            false
                        };

                        if !is_protected {
                            // Sub-microsecond bypass for non-.env files
                            self.respond(fd, FAN_ALLOW);
                            libc::close(fd);
                            offset += metadata.event_len as usize;
                            continue;
                        }

                        // Target file is a protected .env file!
                        let target_str = target_path
                            .as_ref()
                            .map(|p| p.to_string_lossy().to_string())
                            .unwrap_or_else(|| "unknown-path".to_string());

                        let (comm, cmdline) = Self::get_process_info(pid);

                        println!(
                            "\n{} {} Process '{}' (PID: {}) attempting to access {}",
                            "🚨".red(),
                            "[INTERCEPT]".red().bold(),
                            comm.yellow(),
                            pid,
                            target_str.cyan().bold()
                        );
                        println!("   Command line: {}", cmdline.dimmed());

                        let mut authorized = false;

                        // Check if previously authorized PID
                        if self.authorized_pids.contains(&pid) {
                            println!("   {} Re-using authorized session for PID {}", "✓".green(), pid);
                            authorized = true;
                        } else if self.config.auto_popup {
                            println!("   {} Spawning master password prompt...", "⏳".cyan());
                            let prompt_req = PromptRequest {
                                pid,
                                process_name: &comm,
                                target_path: &target_str,
                                timeout_sec: self.config.prompt_timeout_sec,
                            };

                            match Prompter::prompt_password(&prompt_req) {
                                Ok(entered_pwd) => {
                                    if crypto::verify_password(&entered_pwd, &self.config.password_hash) {
                                        println!("   {} Password verified! Access GRANTED.", "✓".green().bold());
                                        authorized = true;
                                        // Cache single authorization or session
                                        self.authorized_pids.insert(pid);
                                    } else {
                                        println!("   {} INCORRECT password entered! Access DENIED.", "✗".red().bold());
                                    }
                                }
                                Err(e) => {
                                    println!("   {} Prompt failed: {} Access DENIED.", "✗".red().bold(), e);
                                }
                            }
                        }

                        if authorized {
                            self.log_event("ALLOW", pid, &comm, &target_str);
                            self.respond(fd, FAN_ALLOW);
                        } else {
                            self.log_event("DENY", pid, &comm, &target_str);
                            self.respond(fd, FAN_DENY);
                        }

                        // Close descriptor given by fanotify
                        libc::close(fd);
                    }

                    offset += metadata.event_len as usize;
                }
            }
        }

        Ok(())
    }
}

impl Drop for FanotifyEngine {
    fn drop(&mut self) {
        if self.fan_fd >= 0 {
            unsafe {
                libc::close(self.fan_fd);
            }
        }
    }
}
