#!/usr/bin/env bash
# HYRE local dev — run from repo root: ./scripts/dev.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "Starting HYRE (frontend :3000 + backend :8000)..."
echo "Open http://localhost:3000/interview"
echo ""

cd "$ROOT"
if ! command -v python3 >/dev/null; then
  echo "python3 is required"
  exit 1
fi

exec npm run dev
