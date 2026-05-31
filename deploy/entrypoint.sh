#!/bin/sh
set -e

# Optional auto-migration on boot (07-env-and-secrets.md §1: RUN_MIGRATIONS).
# Production image ships only dist/, so use the compiled (dist-based) command there.
if [ "$RUN_MIGRATIONS" = "true" ]; then
  if [ -d dist ]; then
    echo "[entrypoint] RUN_MIGRATIONS=true -> migration:run:prod (dist-based)"
    npm run migration:run:prod
  else
    echo "[entrypoint] RUN_MIGRATIONS=true -> migration:run (ts-node, dev)"
    npm run migration:run
  fi
fi

echo "[entrypoint] starting API on port ${PORT:-5013}"
exec node dist/main.js
