#!/bin/bash
# Bloquea writes a archivos protegidos del proyecto social-leads-engine.

set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

BLOCKED_PATTERNS=(
  ".env"
  "package-lock.json"
  ".git/"
  ".next/"
  "node_modules/"
  "content/published/"
)

for pattern in "${BLOCKED_PATTERNS[@]}"; do
  if [[ "$FILE_PATH" == *"$pattern"* ]]; then
    echo "Blocked: $FILE_PATH coincide con patrón protegido '$pattern'." >&2
    echo "Si necesitás escribir ahí, hacelo manualmente o pedile al usuario que apruebe explícito." >&2
    exit 2
  fi
done

if [[ "$FILE_PATH" == *content/published/* ]]; then
  echo "Blocked: content/published/ es un log inmutable." >&2
  exit 2
fi

exit 0
