#!/usr/bin/env bash
set -e

# ==============================================================================
# EnvShield — Universal 1-Line Installer (Zero-Root Required)
# Usage:
#   curl -sSL https://raw.githubusercontent.com/sudarshanj01/OpenSourceHub/main/projects/104-envshield-kernel-guard/install.sh | bash
# ==============================================================================

BOLD='\033[1m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}${BOLD}============================================================${NC}"
echo -e "${CYAN}${BOLD}   🔒 EnvShield — In-Memory Secret Vault & AI Agent DLP     ${NC}"
echo -e "${CYAN}${BOLD}============================================================${NC}"
echo -e "Protects .env secrets from AI agents (Claude Code, Cursor, Aider).\n"

# Determine install target directory
if [ "$EUID" -eq 0 ]; then
  INSTALL_DIR="/usr/local/bin"
else
  INSTALL_DIR="$HOME/.local/bin"
  mkdir -p "$INSTALL_DIR"
fi

INSTALL_BIN="$INSTALL_DIR/envshield"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" 2>/dev/null && pwd || echo "")"

if [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/daemon/target/release/envshield" ]; then
  echo -e "${GREEN}[+]${NC} Installing local release binary to $INSTALL_BIN..."
  cp "$SCRIPT_DIR/daemon/target/release/envshield" "$INSTALL_BIN"
elif [ -f "$HOME/.local/bin/envshield" ] && [ "$INSTALL_BIN" != "$HOME/.local/bin/envshield" ]; then
  cp "$HOME/.local/bin/envshield" "$INSTALL_BIN"
else
  echo -e "${CYAN}[*]${NC} Building binary with Cargo..."
  cd "$SCRIPT_DIR/daemon"
  cargo build --release
  cp target/release/envshield "$INSTALL_BIN"
fi

chmod +x "$INSTALL_BIN"
echo -e "${GREEN}[✓] Installed envshield to: ${BOLD}$INSTALL_BIN${NC}"

# Check PATH
case ":$PATH:" in
  *":$INSTALL_DIR:"*) ;;
  *) echo -e "${YELLOW}[!] Tip: Ensure '$INSTALL_DIR' is in your PATH:${NC}\n    export PATH=\"$INSTALL_DIR:\$PATH\"" ;;
esac

echo ""
echo -e "${GREEN}${BOLD}============================================================${NC}"
echo -e "${GREEN}${BOLD}   ✓ Installation Complete! Zero Root Privileges Needed.    ${NC}"
echo -e "${GREEN}${BOLD}============================================================${NC}"
echo -e "To seal a project and protect secrets from AI agents:"
echo -e "  1. ${BOLD}cd your-project${NC}"
echo -e "  2. ${BOLD}envshield seal${NC}               (encrypts .env & wipes plaintext from disk)"
echo -e "  3. ${BOLD}envshield run -- npm run dev${NC} (runs app with secrets in RAM only)"
echo -e "  4. ${BOLD}envshield edit${NC}               (edit secrets safely in temporary RAM)"
echo -e "  5. ${BOLD}envshield view${NC}               (view secrets in terminal)"
echo -e "  6. ${BOLD}envshield unseal${NC}             (restore plaintext if ever needed)"
