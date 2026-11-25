#!/usr/bin/env bash
set -e

# ==============================================================================
# Shield — Sovereign Secret Isolation CLI Installer
# Usage:
#   curl -sSL https://shield.opensourcehub.dpdns.org/install.sh | bash
# ==============================================================================

BOLD='\033[1m'
COPPER_1='\033[38;2;251;251;249m'
COPPER_2='\033[38;2;248;203;162m'
COPPER_3='\033[38;2;239;152;70m'
COPPER_4='\033[38;2;212;120;42m'
COPPER_5='\033[38;2;168;90;30m'
MUTED='\033[38;2;168;151;133m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_animated_banner() {
  local lines=(
    "${COPPER_1}   ███████╗██╗  ██╗██╗███████╗██╗     ██████╗ ${NC}"
    "${COPPER_2}   ██╔════╝██║  ██║██║██╔════╝██║     ██╔══██╗${NC}"
    "${COPPER_3}   ███████╗███████║██║█████╗  ██║     ██║  ██║${NC}"
    "${COPPER_4}   ╚════██║██╔══██║██║██╔══╝  ██║     ██║  ██║${NC}"
    "${COPPER_5}   ███████║██║  ██║██║███████╗███████╗██████╔╝${NC}"
    "${MUTED}   ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚═════╝ ${NC}"
  )

  echo ""
  for line in "${lines[@]}"; do
    echo -e "$line"
    if [ -t 1 ]; then
      sleep 0.04
    fi
  done
  echo ""
  echo -e "   ${COPPER_3}${BOLD}Sovereign In-Memory Secret Isolation${NC} ${MUTED}• v0.3.0${NC}"
  echo -e "   ${MUTED}Zero plaintext on disk. Zero agent exposure. Zero root.${NC}"
  echo ""
}

print_animated_banner

# Target directory
if [ "$EUID" -eq 0 ]; then
  INSTALL_DIR="/usr/local/bin"
else
  INSTALL_DIR="$HOME/.local/bin"
  mkdir -p "$INSTALL_DIR"
fi

echo -e "${COPPER_3}[*]${NC} Installing Shield CLI into ${BOLD}$INSTALL_DIR${NC}..."

if command -v cargo >/dev/null 2>&1; then
  echo -e "${COPPER_3}[*]${NC} Compiling release binary via cargo..."
  cargo install --git https://github.com/sudarshanj01/OpenSourceHub --bin shield --root "$HOME/.local" 2>/dev/null || {
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
echo -e "${GREEN}${BOLD}✓ Installation Complete! Zero Root Privileges Required.${NC}"
echo ""
echo -e "  ${COPPER_3}1.${NC} ${BOLD}shield seal${NC}            Encrypt .env into .env.vault & shred plaintext"
echo -e "  ${COPPER_3}2.${NC} ${BOLD}shield <command>${NC}       Run any command with secrets injected in RAM"
echo -e "  ${COPPER_3}3.${NC} ${BOLD}shield edit${NC}            Edit secrets securely in volatile RAM"
echo -e "  ${COPPER_3}4.${NC} ${BOLD}shield status${NC}          Verify repository secret protection"
echo ""
