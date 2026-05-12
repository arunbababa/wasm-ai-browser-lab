#!/usr/bin/env bash
set -euo pipefail

cd "$HOME/Dev/wasm-ai-browser-lab"
rm -f /tmp/wrangler-login.out
port="${WRANGLER_CALLBACK_PORT:-8976}"

script -q -f -c \
  "wrangler login --browser false --callback-host localhost --callback-port ${port}" \
  /tmp/wrangler-login.out
