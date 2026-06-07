#!/bin/sh
set -e

# migrate-runner: 마이그레이션은 앱 부팅에서 분리됨.
# 실행 위치: .github/workflows/deploy.yml 의 RunTask 단계 (deploy/migrate-task-def.json 사용).
# 앱 컨테이너는 절대 migration:run 을 호출하지 않는다 — 마이그레이션 실패가 앱 무중단에 영향 없도록.

echo "[entrypoint] starting backend-api on port ${PORT:-5013}"
exec node dist/main.js
