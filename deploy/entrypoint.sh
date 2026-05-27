#!/bin/sh
set -e
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "[entrypoint] RUN_MIGRATIONS=true -> running migrations"
  npm run migration:run
fi
echo "[entrypoint] starting backend-api on port ${PORT:-5013}"
exec node dist/main.js
