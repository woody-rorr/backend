#!/bin/sh
set -e
if [ "$RUN_MIGRATIONS" = "true" ]; then
  if [ -d dist ]; then
    echo "[entrypoint] migration:run:prod"
    npm run migration:run:prod
  else
    echo "[entrypoint] migration:run"
    npm run migration:run
  fi
fi
echo "[entrypoint] starting API on port ${PORT:-5013}"
exec node dist/main.js
