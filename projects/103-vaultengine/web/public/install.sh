#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# VaultEngine Sovereign 1-Line Installer
# Zero-SaaS • Sovereign Continuous Database Archiving • Point-in-Time Recovery
# ==============================================================================

BOLD="\033[1m"
GREEN="\033[32m"
CYAN="\033[36m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

BASE_URL="https://vaultengine.opensourcehub.dpdns.org"

echo -e "${CYAN}${BOLD}"
echo "  ██╗   ██╗ █████╗ ██╗   ██╗██╗  ████████╗███████╗███╗   ██╗ ██████╗ ██╗███╗   ██╗███████╗"
echo "  ██║   ██║██╔══██╗██║   ██║██║  ╚══██╔══╝██╔════╝████╗  ██║██╔════╝ ██║████╗  ██║██╔════╝"
echo "  ██║   ██║███████║██║   ██║██║     ██║   █████╗  ██╔██╗ ██║██║  ███╗██║██╔██╗ ██║█████╗  "
echo "  ╚██╗ ██╔╝██╔══██║██║   ██║██║     ██║   ██╔══╝  ██║╚██╗██║██║   ██║██║██║╚██╗██║██╔══╝  "
echo "   ╚████╔╝ ██║  ██║╚██████╔╝███████╗██║   ███████╗██║ ╚████║╚██████╔╝██║██║ ╚████║███████╗"
echo "    ╚═══╝  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝   ╚══════╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝╚═╝  ╚═══╝╚══════╝"
echo "    Sovereign Continuous Database Archiving & Point-in-Time Recovery Engine"
echo -e "${RESET}"

echo -e "${GREEN}==> Verifying system requirements...${RESET}"

# Check OS
OS="$(uname -s)"
if [ "$OS" != "Linux" ]; then
    echo -e "${RED}Error: VaultEngine currently supports Linux servers only. Found: $OS${RESET}"
    exit 1
fi

# Check Architecture
ARCH="$(uname -m)"
case "$ARCH" in
    x86_64|amd64)
        TARGET_ARCH="x86_64"
        ;;
    aarch64|arm64)
        TARGET_ARCH="x86_64" # Fallback or aarch64
        ;;
    *)
        echo -e "${RED}Unsupported architecture: $ARCH${RESET}"
        exit 1
        ;;
esac

echo -e "    Architecture: ${BOLD}${TARGET_ARCH}${RESET}"

# Check for Database presence
echo -e "${GREEN}==> Scanning local server for database engines...${RESET}"
FOUND_DB=0
if command -v psql >/dev/null 2>&1 || [ -d "/var/lib/postgresql" ]; then
    echo -e "    ${CYAN}✓ Detected PostgreSQL on this host.${RESET}"
    FOUND_DB=1
fi
if command -v mysql >/dev/null 2>&1 || [ -d "/var/lib/mysql" ]; then
    echo -e "    ${CYAN}✓ Detected MySQL / MariaDB on this host.${RESET}"
    FOUND_DB=1
fi
if [ "$FOUND_DB" -eq 0 ]; then
    echo -e "    ${YELLOW}! No standard local database discovered in path. Containerized databases can still be targeted.${RESET}"
fi

# Check EC2 IMDSv2
echo -e "${GREEN}==> Verifying AWS EC2 IAM role / IMDSv2...${RESET}"
if curl -s -m 2 -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 60" >/dev/null 2>&1; then
    echo -e "    ${GREEN}✓ Active EC2 IMDSv2 detected. Zero static AWS keys required!${RESET}"
else
    echo -e "    ${YELLOW}! Non-EC2 or private instance detected. Standard AWS / S3 credentials can be used.${RESET}"
fi

# Binary Installation Path
INSTALL_BIN="/usr/local/bin/vaultengine"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/target/release/vaultengine" ]; then
    echo -e "${GREEN}==> Installing locally compiled binary to $INSTALL_BIN...${RESET}"
    cp "$SCRIPT_DIR/target/release/vaultengine" "$INSTALL_BIN"
    chmod +x "$INSTALL_BIN"
else
    echo -e "${GREEN}==> Downloading pre-compiled static binary from ${BASE_URL}...${RESET}"
    TMP_BIN="$(mktemp)"
    if curl -sSL -f "${BASE_URL}/bin/vaultengine-linux-${TARGET_ARCH}" -o "$TMP_BIN"; then
        mv "$TMP_BIN" "$INSTALL_BIN"
        chmod +x "$INSTALL_BIN"
        echo -e "    ${GREEN}✓ Successfully installed $INSTALL_BIN${RESET}"
    else
        echo -e "${RED}Error: Failed to download binary from ${BASE_URL}/bin/vaultengine-linux-${TARGET_ARCH}${RESET}"
        rm -f "$TMP_BIN"
        exit 1
    fi
fi

# Ensure config directory exists
mkdir -p /etc/vaultengine || true

echo -e "\n${GREEN}${BOLD}✓ VaultEngine successfully installed!${RESET}"
echo -e "\nRun the guided setup wizard to connect your database and S3 bucket:"
echo -e "    ${CYAN}${BOLD}vaultengine init${RESET}\n"
