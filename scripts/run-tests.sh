#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV="${VENV:-$ROOT/.test-venv}"

if [[ ! -d "$VENV" ]]; then
  if command -v python3.12 >/dev/null 2>&1; then
    python3.12 -m venv "$VENV"
  elif command -v python3.11 >/dev/null 2>&1; then
    python3.11 -m venv "$VENV"
  else
    echo "Python 3.11+ required. Install python3.11 or python3.12." >&2
    exit 1
  fi
fi

"$VENV/bin/pip" install -q -r "$ROOT/requirements_test.txt"
"$VENV/bin/python" -m pytest "$ROOT/tests/" "$@"
