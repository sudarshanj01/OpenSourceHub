#!/usr/bin/env bash
set -e

# ==============================================================================
# EnvShield — One-Line Installer & Systemd Service Activator
# ==============================================================================

echo "============================================================"
echo "   🔒 Installing EnvShield Kernel Secret Guard (Rust)"
echo "============================================================"

# Check root
if [ "$EUID" -ne 0 ]; then
  echo "[-] Please run as root: sudo ./install.sh"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if pre-compiled release binary exists
if [ -f "$SCRIPT_DIR/daemon/target/release/envshield" ]; then
  echo "[+] Found compiled release binary."
  cp "$SCRIPT_DIR/daemon/target/release/envshield" /usr/local/bin/envshield
else
  echo "[*] Compiling envshield daemon with Cargo..."
  cd "$SCRIPT_DIR/daemon"
  cargo build --release
  cp target/release/envshield /usr/local/bin/envshield
fi

chmod 755 /usr/local/bin/envshield
echo "[+] Installed binary to /usr/local/bin/envshield"

echo ""
echo "[*] Launching initialization to establish Master Password:"
/usr/local/bin/envshield init --install-service

echo ""
echo "============================================================"
echo "   ✓ EnvShield is now ACTIVE and protecting your machine."
echo "============================================================"
echo "Every .env file access will now require your Master Password."
