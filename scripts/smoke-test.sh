#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"

failures=0

check_status() {
  local name="$1"
  local method="$2"
  local url="$3"
  local expected="$4"
  local data="${5:-}"

  local status
  if [[ -n "$data" ]]; then
    status=$(curl -sS -o /tmp/flowforge_smoke_body.json -w "%{http_code}" -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -d "$data" || true)
  else
    status=$(curl -sS -o /tmp/flowforge_smoke_body.json -w "%{http_code}" -X "$method" "$url" || true)
  fi

  if [[ "$status" != "$expected" ]]; then
    echo "❌ ${name} expected ${expected}, got ${status}"
    cat /tmp/flowforge_smoke_body.json || true
    failures=$((failures + 1))
  else
    echo "✅ ${name} (${status})"
  fi
}

echo "Running FlowForge smoke test against ${BASE_URL}"

check_status "Health check" "GET" "${BASE_URL}/api/health" "200"

if [[ -n "${ACCESS_PASSWORD:-}" ]]; then
  check_status "Auth login" "POST" "${BASE_URL}/api/auth/login" "200" "{\"password\":\"${ACCESS_PASSWORD}\"}"
else
  echo "⚠️  ACCESS_PASSWORD not set; skipping /api/auth/login."
fi

if [[ -n "${MOONSHOT_API_KEY:-}" ]]; then
  check_status "AI analyze" "POST" "${BASE_URL}/api/ai/analyze" "200" \
    "{\"currentProcess\":\"Client onboarding with manual forms and approvals.\",\"desiredOutcome\":\"Reduce onboarding time and improve compliance.\",\"industry\":\"Wealth Management\"}"
else
  echo "⚠️  MOONSHOT_API_KEY not set; skipping /api/ai/analyze."
fi

if [[ "$failures" -gt 0 ]]; then
  echo "Smoke test failed with ${failures} failure(s)."
  exit 1
fi

echo "Smoke test passed."
