#!/usr/bin/env bash
# Run the Ridgeline API Sandbox locally, end to end.
#
#   npm run local                 dev server (hot reload) on :4100, then smoke test
#   npm run local -- --prod       production build + next start (closest to Vercel)
#   npm run local -- --port 5000  different port
#   npm run local -- --no-smoke   skip the smoke test
#   npm run local -- --gateway    gateway mode: APIs only, no docs page/specs/collections (the demo's before run)
#   npm run local -- --terse-errors  errors return status text only, like most internal APIs
#   npm run local -- --fresh-keys regenerate .env.local (new keys; re-seed your vault afterwards)
#
# First run it will: install deps, create .env.local with defined keys, and write the demo env files.
# Ctrl+C stops the server.
set -euo pipefail
cd "$(dirname "$0")/.."

PORT=4100
MODE=dev
SMOKE=1
FRESH=0
while [ $# -gt 0 ]; do
  case "$1" in
    --prod) MODE=prod ;;
    --port) PORT="$2"; shift ;;
    --no-smoke) SMOKE=0 ;;
    --gateway) export RIDGELINE_GATEWAY=1 ;;
    --terse-errors) export RIDGELINE_TERSE_ERRORS=1 ;;
    --fresh-keys) FRESH=1 ;;
    -h|--help) sed -n '2,13p' "$0"; exit 0 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
  shift
done

say() { printf '\033[1m▸ %s\033[0m\n' "$*"; }
BASE="http://localhost:$PORT"

# 1. Toolchain
command -v node >/dev/null || { echo "Node.js 20+ is required (brew install node)."; exit 1; }
NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
[ "$NODE_MAJOR" -ge 20 ] || { echo "Node.js 20+ is required (found $(node -v))."; exit 1; }

# 2. Dependencies
if [ ! -d node_modules/next ]; then
  say "Installing dependencies"
  npm install --no-audit --no-fund
fi

# 3. Keys (the "real secrets" the APIs validate against)
if [ ! -f .env.local ] || [ "$FRESH" = 1 ]; then
  say "Creating .env.local with a fresh set of API keys"
  npm run -s keys > .env.local
  echo "  (Store these in your Passport vault: passport/vault-seed.sh hashicorp|aws|gcp)"
fi
set -a; . ./.env.local; set +a

# 4. Port check
if lsof -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port $PORT is already in use. Stop that process or pass --port <n>."
  exit 1
fi

# 5. Demo env files pointing at the local server (bet-slip .env/.env.passport, transcript, agent .env)
say "Writing demo env files for $BASE"
SANDBOX_BASE_URL="$BASE" node scripts/demo-env.mjs | sed 's/^/  /'
# Local-only agent config with raw keys (Passport can't intercept localhost). Not scanned by `npm run grep`.
cat > demo/agent/.env.local-raw <<RAW
# boost-ops against the LOCAL sandbox with raw keys. Local testing only; on stage use .env (Passport references).
RIDGELINE_BASE_URL=$BASE
RIDGELINE_MARKETS_KEY=$API_KEY_MARKETS
RIDGELINE_WALLET_KEY=$API_KEY_WALLET
RIDGELINE_PROMOTIONS_KEY=$API_KEY_PROMOTIONS
RIDGELINE_PLAYER_LIMITS_KEY=$API_KEY_PLAYER_LIMITS
RIDGELINE_BETS_KEY=$API_KEY_BETS
RIDGELINE_GEO_COMPLIANCE_KEY=$API_KEY_GEO_COMPLIANCE
PASSPORT_PROXY_URL=
RIDGELINE_AGENT_MODEL=anthropic/claude-sonnet-4-5
# ANTHROPIC_API_KEY is read from your shell.
RAW
echo "  wrote demo/agent/.env.local-raw (raw keys, local agent runs only)"

# 6. Start the server
if [ "$MODE" = prod ]; then
  say "Building (production)"
  npx next build >/tmp/ridgeline-build.log 2>&1 || { cat /tmp/ridgeline-build.log; exit 1; }
  say "Starting next start on $BASE"
  npx next start -p "$PORT" &
else
  say "Starting next dev on $BASE"
  npx next dev -p "$PORT" &
fi
SERVER_PID=$!
trap 'echo; say "Stopping server"; kill $SERVER_PID 2>/dev/null; wait $SERVER_PID 2>/dev/null' EXIT INT TERM

# 7. Wait for health
for i in $(seq 1 60); do
  if curl -fsS "$BASE/healthz" >/dev/null 2>&1; then break; fi
  sleep 1
  [ "$i" = 60 ] && { echo "Server did not become healthy on $BASE"; exit 1; }
done

# 8. Smoke test (raw keys, API-owner check), then reset state so the demo starts clean
if [ "$SMOKE" = 1 ]; then
  say "Smoke test"
  SANDBOX_BASE_URL="$BASE" node scripts/smoke.mjs | sed 's/^/  /' || { echo "Smoke test failed."; exit 1; }
fi
curl -fsS -X POST "$BASE/admin/v1/reset" -H "Authorization: Bearer $API_KEY_ADMIN" >/dev/null && echo "  sandbox state reset"

cat <<EOF

$(say "Ridgeline API Sandbox is running")
  Docs        $BASE
  Health      $BASE/healthz
  Specs       $BASE/specs/<api>.openapi.json
  Postman     $BASE/postman/   (import public/postman/*.json; use "Ridgeline Sandbox · Local")

  Try it:
    curl -s -X POST $BASE/player-limits/v1/eligibility/check \\
      -H "Authorization: Bearer \$API_KEY_PLAYER_LIMITS" -H 'content-type: application/json' \\
      -d '{"player_id":"P-1003","product":"sportsbook"}'

  Demo:
    npm run grep                         raw keys in demo/bet-slip/.env and the agent transcript
    cd demo/agent && bun install && set -a && . ./.env.local-raw && set +a && bun agent/local.ts
                                         boost-ops against the local sandbox (needs ANTHROPIC_API_KEY in your shell)

  Note: Passport bypasses localhost, so the Passport half of the demo needs the Vercel deployment.
  Ctrl+C to stop.
EOF

wait $SERVER_PID
