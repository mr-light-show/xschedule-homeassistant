#!/bin/bash

# Script to update version numbers across xSchedule project files
# Usage: ./update-version.sh <action|new-version>
# Actions: major, minor, patch, pre
# Examples:
#   ./update-version.sh major    # 1.3.0 -> 2.0.0
#   ./update-version.sh minor    # 1.3.0 -> 1.4.0
#   ./update-version.sh patch    # 1.3.0 -> 1.3.1
#   ./update-version.sh pre      # 1.3.0 -> 1.3.1-pre1
#   ./update-version.sh 1.2.2    # Explicit version (backward compatible)

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

# Get script directory (repository root)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Function to get current version from manifest.json
get_current_version_from_manifest() {
    local manifest="$SCRIPT_DIR/custom_components/xschedule/manifest.json"
    if [ ! -f "$manifest" ]; then
        print_error "manifest.json not found at: $manifest"
        exit 1
    fi
    grep -o '"version": "[^"]*"' "$manifest" | sed 's/"version": "\(.*\)"/\1/'
}

# Function to calculate next version based on action
calculate_next_version() {
    local current="$1"
    local action="$2"

    # Parse version: extract major, minor, patch, and optional prerelease
    if [[ "$current" =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)(-pre([0-9]+))?$ ]]; then
        local major="${BASH_REMATCH[1]}"
        local minor="${BASH_REMATCH[2]}"
        local patch="${BASH_REMATCH[3]}"
        local has_pre="${BASH_REMATCH[4]}"
        local pre_num="${BASH_REMATCH[5]}"
    else
        print_error "Cannot parse current version: $current"
        exit 1
    fi

    local new_version=""

    case "$action" in
        major)
            # Increment major, reset minor and patch to 0
            major=$((major + 1))
            minor=0
            patch=0
            new_version="${major}.${minor}.${patch}"
            ;;
        minor)
            # Increment minor, reset patch to 0
            minor=$((minor + 1))
            patch=0
            new_version="${major}.${minor}.${patch}"
            ;;
        patch)
            # Increment patch
            patch=$((patch + 1))
            new_version="${major}.${minor}.${patch}"
            ;;
        pre)
            if [ -n "$has_pre" ]; then
                # Already a prerelease - increment pre number
                pre_num=$((pre_num + 1))
                new_version="${major}.${minor}.${patch}-pre${pre_num}"
            else
                # Not a prerelease - increment patch and add -pre1
                patch=$((patch + 1))
                new_version="${major}.${minor}.${patch}-pre1"
            fi
            ;;
        *)
            print_error "Unknown action: $action"
            exit 1
            ;;
    esac

    echo "$new_version"
}

# Check if action or version argument is provided
if [ -z "$1" ]; then
    print_error "Action or version argument is required"
    echo "Usage: $0 <action|version>"
    echo ""
    echo "Actions:"
    echo "  major    Increment major version (X.0.0)"
    echo "  minor    Increment minor version (x.Y.0)"
    echo "  patch    Increment patch version (x.y.Z)"
    echo "  pre      Create or increment prerelease (x.y.Z-preN)"
    echo ""
    echo "Examples:"
    echo "  $0 major      # 1.3.0 -> 2.0.0"
    echo "  $0 minor      # 1.3.0 -> 1.4.0"
    echo "  $0 patch      # 1.3.0 -> 1.3.1"
    echo "  $0 pre        # 1.3.0 -> 1.3.1-pre1"
    echo "  $0 pre        # 1.3.1-pre1 -> 1.3.1-pre2"
    echo "  $0 1.5.0      # Explicit version (backward compatible)"
    exit 1
fi

ACTION_OR_VERSION="$1"

# Check if input is an action keyword or explicit version
if [[ "$ACTION_OR_VERSION" =~ ^(major|minor|patch|pre)$ ]]; then
    # It's an action - calculate next version
    CURRENT_VERSION=$(get_current_version_from_manifest)
    NEW_VERSION=$(calculate_next_version "$CURRENT_VERSION" "$ACTION_OR_VERSION")

    echo ""
    print_info "Action: $ACTION_OR_VERSION"
    print_info "Current version: $CURRENT_VERSION"
    print_info "New version: $NEW_VERSION"
    echo ""
else
    # It's an explicit version - use it directly (backward compatibility)
    NEW_VERSION="$ACTION_OR_VERSION"

    # Validate version format (basic semantic versioning with optional pre-release)
    if ! [[ "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)?$ ]]; then
        print_error "Invalid version format: $NEW_VERSION"
        echo "Version must follow format: X.Y.Z or X.Y.Z-preN"
        echo "Examples: 1.2.2, 1.2.2-pre1, 1.2.2-alpha"
        exit 1
    fi

    echo ""
    print_info "Using explicit version: $NEW_VERSION"
    echo ""
fi

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

# Build minified files
print_info "Building minified files..."
if npm run build; then
    print_success "Minified files built successfully"
else
    print_error "Failed to build minified files"
    exit 1
fi
echo ""

print_info "Next steps:"
echo "  1. Review changes with 'git diff'"
echo "  2. Commit changes with 'git add' and 'git commit'"
echo ""
