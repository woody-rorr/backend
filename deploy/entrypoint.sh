#!/bin/sh
set -e

# Migration execution — environment auto-detect (db_migration.md §6)
# production image ships dist/ only (no src/), so ts-node commands would fail.
if [ "$RUN_MIGRATIONS" = "true" ]; then
  if [ -d dist ]; then
    echo "[entrypoint] RUN_MIGRATIONS=true -> migration:run:prod (dist-based)"
    npm run migration:run:prod
  else
    echo "[entrypoint] RUN_MIGRATIONS=true -> migration:run (ts-node, dev)"
    npm run migration:run
  fi
fi

echo "[entrypoint] starting app on port ${PORT:-5013}"
exec node dist/main.js
