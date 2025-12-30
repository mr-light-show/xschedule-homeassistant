#!/bin/bash
set -e

# xSchedule Development Deployment Script
# Copies custom component files to Home Assistant using rsync
# Usage: ./deploy.sh [--restart]

# Configuration
HA_HOST="homeassistant.local"
HA_USER="$USER"
HA_CONFIG_DIR="/config"
COMPONENT_NAME="xschedule"

# Restart configuration (used with --restart flag)
HA_PORT="8123"
# Load HA token from file (create scripts/HA_TOKEN with your long-lived access token)
# Generate one at: Profile -> Security -> Long-Lived Access Tokens -> Create Token
TOKEN_FILE="$(dirname "$0")/HA_TOKEN"
if [ -f "$TOKEN_FILE" ]; then
    HA_TOKEN=$(cat "$TOKEN_FILE" | tr -d '[:space:]')
else
    HA_TOKEN=""
fi

# Parse arguments
DO_RESTART=false
for arg in "$@"; do
    case $arg in
        --restart|-r)
            DO_RESTART=true
            ;;
    esac
done

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
if [ "$DO_RESTART" = true ]; then
    echo -e "${BLUE}  xSchedule Deploy + Restart${NC}"
else
    echo -e "${BLUE}  xSchedule Development Deployment${NC}"
fi
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"

# Check for SSH key authentication
echo -e "${YELLOW}Checking SSH connection...${NC}"
if ! ssh -o BatchMode=yes -o ConnectTimeout=5 ${HA_USER}@${HA_HOST} exit 2>/dev/null; then
    echo -e "${YELLOW}⚠ SSH key authentication not set up${NC}"
    echo ""
    echo "To avoid password prompts on every deployment, set up SSH keys:"
    echo -e "  ${GREEN}ssh-copy-id ${HA_USER}@${HA_HOST}${NC}"
    echo ""
    echo "You will be prompted for your password 2-3 times during this deployment."
    echo ""
    read -p "Press Enter to continue or Ctrl+C to cancel..."
fi

# Check if custom_components directory exists locally
if [ ! -d "custom_components/$COMPONENT_NAME" ]; then
    echo -e "${RED}Error: custom_components/$COMPONENT_NAME directory not found${NC}"
    echo "Please run this script from the repository root"
    exit 1
fi

# Build frontend assets if needed
if [ -f "cards/package.json" ]; then
    echo -e "${YELLOW}Building frontend assets...${NC}"
    npm run build --prefix cards
    echo -e "${GREEN}✓ Frontend build complete${NC}"
fi

# Fix permissions on remote directory (in case it's owned by root)
echo -e "${YELLOW}Fixing remote directory permissions...${NC}"
ssh ${HA_USER}@${HA_HOST} "sudo chown -R ${HA_USER}:${HA_USER} ${HA_CONFIG_DIR}/custom_components/${COMPONENT_NAME} 2>/dev/null || true"
echo -e "${GREEN}✓ Permissions updated${NC}"

# Sync custom component Python files
echo -e "${YELLOW}Syncing custom component files...${NC}"
echo ""

# Capture rsync output to detect changes
CHANGES_FILE=$(mktemp)
trap "rm -f $CHANGES_FILE" EXIT

# Use --itemize-changes for change detection
# Format: YXcstpoguax path (Y=update type, X=file type)
rsync -az --checksum --delete --itemize-changes \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='*.pyo' \
    --exclude='.DS_Store' \
    --exclude='*.swp' \
    --exclude='*~' \
    custom_components/$COMPONENT_NAME/ \
    ${HA_USER}@${HA_HOST}:${HA_CONFIG_DIR}/custom_components/${COMPONENT_NAME}/ \
    > "$CHANGES_FILE" 2>&1

# Display changes with colors
CHANGES_MADE=false
while IFS= read -r line; do
    # Skip empty lines and stats lines
    [[ -z "$line" ]] && continue
    [[ "$line" == "Number of"* ]] && continue
    [[ "$line" == "Total"* ]] && continue
    [[ "$line" == "File list"* ]] && continue
    [[ "$line" == "Unmatched"* ]] && continue
    [[ "$line" == "Matched"* ]] && continue
    [[ "$line" == "sent"* ]] && continue
    [[ "$line" == "total size"* ]] && continue
    
    if [[ "$line" == "<"* ]] || [[ "$line" == ">"* ]]; then
        # File being transferred (< or > followed by file type)
        file=$(echo "$line" | sed 's/^[^ ]* //')
        echo -e "  ${GREEN}↑${NC} $file"
        CHANGES_MADE=true
    elif [[ "$line" == "*deleting"* ]]; then
        # File being deleted
        file=$(echo "$line" | sed 's/\*deleting *//')
        echo -e "  ${RED}✗${NC} $file (deleted)"
        CHANGES_MADE=true
    elif [[ "$line" == "cd"* ]]; then
        # Directory being created
        file=$(echo "$line" | sed 's/^[^ ]* //')
        echo -e "  ${BLUE}+${NC} $file/"
        CHANGES_MADE=true
    fi
done < "$CHANGES_FILE"

echo ""

# Summary and restart logic
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
if [ "$CHANGES_MADE" = true ]; then
    echo -e "${GREEN}Deployment complete!${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
    
    # Restart if requested
    if [ "$DO_RESTART" = true ]; then
        if [ -z "$HA_TOKEN" ]; then
            echo ""
            echo -e "${RED}Error: No HA token found. Create scripts/HA_TOKEN with your token.${NC}"
            echo "Generate one at: Profile -> Security -> Long-Lived Access Tokens -> Create Token"
            exit 1
        fi
        
        echo ""
        echo -e "${YELLOW}Restarting Home Assistant...${NC}"
        curl -X POST \
          -H "Authorization: Bearer ${HA_TOKEN}" \
          -H "Content-Type: application/json" \
          -s \
          "http://${HA_HOST}:${HA_PORT}/api/services/homeassistant/restart" \
          > /dev/null
        
        echo -e "${GREEN}✓ Home Assistant restart initiated${NC}"
        echo ""
        echo -e "${YELLOW}Note:${NC} Home Assistant is restarting. This may take 30-60 seconds."
        echo "      Clear browser cache (Ctrl+Shift+R) if needed."
    else
        echo ""
        echo "Next steps:"
        echo "  1. Restart Home Assistant to load changes"
        echo "  2. Clear browser cache (Ctrl+Shift+R) if needed"
        echo ""
        echo "Quick commands:"
        echo -e "  ${YELLOW}Restart HA:${NC} ssh ${HA_USER}@${HA_HOST} 'ha core restart'"
        echo -e "  ${YELLOW}Check logs:${NC} ssh ${HA_USER}@${HA_HOST} 'tail -f /config/home-assistant.log'"
    fi
    echo ""
    exit 0
else
    echo -e "${GREEN}Already up to date!${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
    if [ "$DO_RESTART" = true ]; then
        echo ""
        echo -e "${YELLOW}Skipping restart - no changes detected${NC}"
    fi
    echo ""
    exit 0
fi
