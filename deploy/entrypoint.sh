#!/bin/sh
set -e

if [ "$RUN_MIGRATIONS" = "true" ]; then
  if [ -d dist ]; then
    echo "[entrypoint] RUN_MIGRATIONS=true -> migration:run:prod (dist-based)"
    npm run migration:run:prod
  else
    echo "[entrypoint] RUN_MIGRATIONS=true -> migration:run (ts-node, dev)"
    npm run migration:run
  fi
fi

echo "[entrypoint] starting backend-api on port ${PORT:-5013}"
exec node dist/main.js
