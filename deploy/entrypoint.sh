#!/usr/bin/env bash
set -euo pipefail

SSM_PREFIX="${SSM_PREFIX:-/backend-api-service}"
AWS_REGION="${AWS_REGION:-${AWS_DEFAULT_REGION:-us-east-1}}"

log() {
  printf '[entrypoint] %s\n' "$*" >&2
}

to_env_key() {
  printf '%s' "$1" | awk -F/ '{print $NF}' | tr '[:lower:]-' '[:upper:]_'
}

log "Loading SSM parameters from prefix '${SSM_PREFIX}' in region '${AWS_REGION}'"

if ! command -v aws >/dev/null 2>&1; then
  log "aws CLI not found in PATH; aborting"
  exit 1
fi

TMP_PARAMS="$(mktemp)"
trap 'rm -f "${TMP_PARAMS}"' EXIT

NEXT_TOKEN=""
SSM_OK=1
while : ; do
  if [ -n "${NEXT_TOKEN}" ]; then
    RESP="$(aws ssm get-parameters-by-path \
      --region "${AWS_REGION}" \
      --path "${SSM_PREFIX}" \
      --recursive \
      --with-decryption \
      --max-items 10 \
      --starting-token "${NEXT_TOKEN}" \
      --output json 2>&1)" || { SSM_OK=0; break; }
  else
    RESP="$(aws ssm get-parameters-by-path \
      --region "${AWS_REGION}" \
      --path "${SSM_PREFIX}" \
      --recursive \
      --with-decryption \
      --max-items 10 \
      --output json 2>&1)" || { SSM_OK=0; break; }
  fi

  printf '%s' "${RESP}" | jq -r '.Parameters[] | "\(.Name)\t\(.Value)"' >> "${TMP_PARAMS}"

  NEXT_TOKEN="$(printf '%s' "${RESP}" | jq -r '.NextToken // empty')"
  if [ -z "${NEXT_TOKEN}" ]; then
    break
  fi
done

if [ "${SSM_OK}" -eq 0 ]; then
  log "SSM fetch failed for prefix '${SSM_PREFIX}' (likely no permission or no params). Continuing without injection."
  log "  AWS response: ${RESP}"
  : > "${TMP_PARAMS}"
fi

INJECTED=0
while IFS=$'\t' read -r NAME VALUE; do
  [ -z "${NAME}" ] && continue
  KEY="$(to_env_key "${NAME}")"
  if [ -z "${KEY}" ]; then
    continue
  fi
  export "${KEY}=${VALUE}"
  INJECTED=$((INJECTED + 1))
  log "Injected ${KEY} from ${NAME}"
done < "${TMP_PARAMS}"

log "Loaded ${INJECTED} parameter(s) from SSM"

if [ "$#" -eq 0 ]; then
  set -- node src/server.js
fi

log "Executing: $*"
exec "$@"
