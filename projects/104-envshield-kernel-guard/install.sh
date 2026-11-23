#!/usr/bin/env bash
set -e

# ==============================================================================
# EnvShield — Universal 1-Line Global Installer
# Usage:
#   curl -sSL https://raw.githubusercontent.com/sudarshanj01/OpenSourceHub/main/projects/104-envshield-kernel-guard/install.sh | sudo bash
# ==============================================================================

BOLD='\033[1m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}${BOLD}============================================================${NC}"
echo -e "${CYAN}${BOLD}   🔒 EnvShield — Universal Kernel Secret Guard Installer   ${NC}"
echo -e "${CYAN}${BOLD}============================================================${NC}"
echo -e "Protecting your developer secrets (.env) from AI agents at the Linux kernel boundary.\n"

# Verify root privileges
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] This installer must be run with sudo:${NC}"
  echo -e "  curl -sSL ... | sudo bash"
  exit 1
fi

INSTALL_BIN="/usr/local/bin/envshield"
ARCH="$(uname -m)"
OS="$(uname -s)"

if [ "$OS" != "Linux" ]; then
  echo -e "${RED}[ERROR] EnvShield currently supports Linux with fanotify (macOS and Windows coming soon).${NC}"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" 2>/dev/null && pwd || echo "")"

# Check if local pre-built binary exists in repo directory
if [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/daemon/target/release/envshield" ]; then
  echo -e "${GREEN}[+]${NC} Installing from local compiled release binary..."
  cp "$SCRIPT_DIR/daemon/target/release/envshield" "$INSTALL_BIN"
elif [ -f "/home/$SUDO_USER/.local/bin/envshield" ]; then
  echo -e "${GREEN}[+]${NC} Installing pre-built binary from user environment..."
  cp "/home/$SUDO_USER/.local/bin/envshield" "$INSTALL_BIN"
else
  echo -e "${CYAN}[*]${NC} Downloading pre-compiled static binary for ${ARCH}..."
  DOWNLOAD_URL="https://github.com/sudarshanj01/OpenSourceHub/releases/latest/download/envshield-linux-${ARCH}"
  if curl -fsSL "$DOWNLOAD_URL" -o "$INSTALL_BIN" 2>/dev/null; then
    echo -e "${GREEN}[+]${NC} Downloaded static binary."
  else
    echo -e "${YELLOW}[!]${NC} Remote release asset not found. Building locally via Cargo..."
    if command -v cargo >/dev/null 2>&1; then
      cd "$SCRIPT_DIR/daemon" 2>/dev/null || cd /tmp
      cargo build --release
      cp target/release/envshield "$INSTALL_BIN"
    else
      echo -e "${RED}[ERROR] Could not download prebuilt binary and cargo is not installed.${NC}"
      exit 1
    fi
  fi
fi

chmod 755 "$INSTALL_BIN"
echo -e "${GREEN}[✓]${NC} Installed global binary to: ${BOLD}$INSTALL_BIN${NC}"

# Check for zenity / pinentry for desktop prompts
if ! command -v zenity >/dev/null 2>&1; then
  echo -e "${YELLOW}[!]${NC} Tip: 'zenity' is recommended for native desktop popups. Installing via apt if available..."
  apt-get update -qq && apt-get install -y -qq zenity >/dev/null 2>&1 || true
fi

echo ""
echo -e "${CYAN}${BOLD}[*] Initializing Master Password Setup:${NC}"
"$INSTALL_BIN" init --install-service

echo ""
echo -e "${GREEN}${BOLD}============================================================${NC}"
echo -e "${GREEN}${BOLD}   ✓ EnvShield is now INSTALLED and ACTIVE globally!        ${NC}"
echo -e "${GREEN}${BOLD}============================================================${NC}"
echo -e "Every access to any .env file in the entire filesystem will now"
echo -e "trigger a desktop password prompt. Without your password, no agent"
echo -e "or script can read or modify your secrets.\n"
echo -e "Useful commands:"
echo -e "  • ${BOLD}envshield status${NC}           - View protection status & logs"
echo -e "  • ${BOLD}envshield scan${NC}             - Locate all shielded .env files"
echo -e "  • ${BOLD}sudo envshield uninstall${NC}   - Safely remove the shield"
