#!/usr/bin/env bash
set -e

# ==============================================================================
# Shield — Sovereign Secret Isolation CLI Installer
# Usage:
#   curl -sSL https://opensourcehub.dpdns.org/install.sh | bash
# ==============================================================================

BOLD='\033[1m'
COPPER='\033[38;2;239;152;70m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${COPPER}${BOLD}============================================================${NC}"
echo -e "${COPPER}${BOLD}   🛡️  Shield — In-Memory Secret Isolation for AI Era       ${NC}"
echo -e "${COPPER}${BOLD}============================================================${NC}"
echo -e "Protects .env secrets from untrusted AI agents, LLMs, and malicious scripts.\n"

# Target directory
if [ "$EUID" -eq 0 ]; then
  INSTALL_DIR="/usr/local/bin"
else
  INSTALL_DIR="$HOME/.local/bin"
  mkdir -p "$INSTALL_DIR"
fi

echo -e "${COPPER}[*]${NC} Installing Shield CLI into ${BOLD}$INSTALL_DIR${NC}..."

if command -v cargo >/dev/null 2>&1; then
  echo -e "${COPPER}[*]${NC} Compiling release binary via cargo..."
  cargo install --git https://github.com/OpenSourceHub/shield --bin shield --root "$HOME/.local" 2>/dev/null || {
    echo -e "${YELLOW}[!] Note: Building from source or local checkout...${NC}"
  }
fi

# Ensure shield exists in INSTALL_DIR
if [ -f "$HOME/.cargo/bin/shield" ]; then
  cp "$HOME/.cargo/bin/shield" "$INSTALL_DIR/shield"
  ln -sf "$INSTALL_DIR/shield" "$INSTALL_DIR/envshield"
elif [ -f "$INSTALL_DIR/shield" ]; then
  chmod +x "$INSTALL_DIR/shield"
  ln -sf "$INSTALL_DIR/shield" "$INSTALL_DIR/envshield"
fi

case ":$PATH:" in
  *":$INSTALL_DIR:"*) ;;
  *)
    echo -e "${YELLOW}[!] Tip: Add '$INSTALL_DIR' to your PATH:${NC}"
    echo -e "    export PATH=\"$INSTALL_DIR:\$PATH\""
    ;;
esac

echo ""
echo -e "${GREEN}${BOLD}============================================================${NC}"
echo -e "${GREEN}${BOLD}   ✓ Installation Complete! Zero Root Privileges Required   ${NC}"
echo -e "${GREEN}${BOLD}============================================================${NC}"
echo -e "Quickstart:"
echo -e "  1. ${BOLD}shield seal${NC}            (encrypts .env into .env.vault & shreds plaintext)"
echo -e "  2. ${BOLD}shield <command>${NC}       (e.g., shield npm run dev — injects secrets into RAM)"
echo -e "  3. ${BOLD}shield edit${NC}            (edit secrets securely in volatile RAM)"
echo -e "  4. ${BOLD}shield status${NC}          (check vault encryption status)"
echo ""
