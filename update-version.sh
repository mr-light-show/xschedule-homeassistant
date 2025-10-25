#!/bin/bash

# Script to update version numbers across xSchedule project files
# Usage: ./update-version.sh <new-version>
# Example: ./update-version.sh 1.2.2
# Example: ./update-version.sh 1.2.2-pre1

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_error() {
    echo -e "${RED}Error: $1${NC}" >&2
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Check if version argument is provided
if [ -z "$1" ]; then
    print_error "Version argument is required"
    echo "Usage: $0 <new-version>"
    echo "Example: $0 1.2.2"
    echo "Example: $0 1.2.2-pre1"
    exit 1
fi

NEW_VERSION="$1"

# Validate version format (basic semantic versioning with optional pre-release)
if ! [[ "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)?$ ]]; then
    print_error "Invalid version format: $NEW_VERSION"
    echo "Version must follow format: X.Y.Z or X.Y.Z-preN"
    echo "Examples: 1.2.2, 1.2.2-pre1, 1.2.2-alpha"
    exit 1
fi

# Get script directory (repository root)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Define files to update
MANIFEST_FILE="$SCRIPT_DIR/custom_components/xschedule/manifest.json"
PACKAGE_FILE="$SCRIPT_DIR/package.json"
CARD_FILE="$SCRIPT_DIR/src/xschedule-card.js"
BROWSER_FILE="$SCRIPT_DIR/src/xschedule-playlist-browser.js"

# Check if all files exist
MISSING_FILES=0
for file in "$MANIFEST_FILE" "$PACKAGE_FILE" "$CARD_FILE" "$BROWSER_FILE"; do
    if [ ! -f "$file" ]; then
        print_error "File not found: $file"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
done

if [ $MISSING_FILES -gt 0 ]; then
    print_error "Cannot proceed: $MISSING_FILES file(s) missing"
    exit 1
fi

echo ""
print_info "Updating version to: $NEW_VERSION"
echo ""

# Function to get current version from a file
get_current_version() {
    local file="$1"
    local pattern="$2"
    grep -o "$pattern" "$file" | head -1 || echo "unknown"
}

# Update manifest.json
CURRENT_MANIFEST=$(get_current_version "$MANIFEST_FILE" '"version": "[^"]*"')
print_info "Updating manifest.json..."
echo "  Current: $CURRENT_MANIFEST"
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS (BSD sed)
    sed -i '' 's/"version": "[^"]*"/"version": "'"$NEW_VERSION"'"/' "$MANIFEST_FILE"
else
    # Linux (GNU sed)
    sed -i 's/"version": "[^"]*"/"version": "'"$NEW_VERSION"'"/' "$MANIFEST_FILE"
fi
NEW_MANIFEST=$(get_current_version "$MANIFEST_FILE" '"version": "[^"]*"')
echo "  Updated: $NEW_MANIFEST"
print_success "manifest.json updated"
echo ""

# Update package.json
CURRENT_PACKAGE=$(get_current_version "$PACKAGE_FILE" '"version": "[^"]*"')
print_info "Updating package.json..."
echo "  Current: $CURRENT_PACKAGE"
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' 's/"version": "[^"]*"/"version": "'"$NEW_VERSION"'"/' "$PACKAGE_FILE"
else
    sed -i 's/"version": "[^"]*"/"version": "'"$NEW_VERSION"'"/' "$PACKAGE_FILE"
fi
NEW_PACKAGE=$(get_current_version "$PACKAGE_FILE" '"version": "[^"]*"')
echo "  Updated: $NEW_PACKAGE"
print_success "package.json updated"
echo ""

# Update xschedule-card.js
CURRENT_CARD=$(get_current_version "$CARD_FILE" 'Version [0-9][^[:space:]]*')
print_info "Updating xschedule-card.js..."
echo "  Current: $CURRENT_CARD"
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' 's/Version [0-9][^[:space:]]*/Version '"$NEW_VERSION"'/' "$CARD_FILE"
else
    sed -i 's/Version [0-9][^[:space:]]*/Version '"$NEW_VERSION"'/' "$CARD_FILE"
fi
NEW_CARD=$(get_current_version "$CARD_FILE" 'Version [0-9][^[:space:]]*')
echo "  Updated: $NEW_CARD"
print_success "xschedule-card.js updated"
echo ""

# Update xschedule-playlist-browser.js
CURRENT_BROWSER=$(get_current_version "$BROWSER_FILE" 'Version [0-9][^[:space:]]*')
print_info "Updating xschedule-playlist-browser.js..."
echo "  Current: $CURRENT_BROWSER"
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' 's/Version [0-9][^[:space:]]*/Version '"$NEW_VERSION"'/' "$BROWSER_FILE"
else
    sed -i 's/Version [0-9][^[:space:]]*/Version '"$NEW_VERSION"'/' "$BROWSER_FILE"
fi
NEW_BROWSER=$(get_current_version "$BROWSER_FILE" 'Version [0-9][^[:space:]]*')
echo "  Updated: $NEW_BROWSER"
print_success "xschedule-playlist-browser.js updated"
echo ""

# Summary
print_success "All version numbers updated to: $NEW_VERSION"
echo ""
echo "Files modified:"
echo "  - custom_components/xschedule/manifest.json"
echo "  - package.json"
echo "  - src/xschedule-card.js"
echo "  - src/xschedule-playlist-browser.js"
echo ""
print_info "Next steps:"
echo "  1. Run 'npm run build' to rebuild minified files"
echo "  2. Review changes with 'git diff'"
echo "  3. Commit changes with 'git add' and 'git commit'"
echo ""
