#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

echo "[post-merge] Installing locked dependencies..."
npm ci --no-audit --no-fund

echo "[post-merge] Building the application..."
npm run build

# Database schema changes are intentionally not pushed automatically:
# drizzle-kit push can request destructive confirmation for existing data.
# Handle reviewed schema changes with an explicit migration step.
echo "[post-merge] Setup complete."
