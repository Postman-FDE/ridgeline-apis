#!/usr/bin/env bash
# The verify beat: the phantom-endpoint check, then the owning teams' acceptance suite (Ridgeline · bet-slip acceptance (TKT-2481)) against
# the agent's actual bet-slip, headless, with the Postman CLI. The agent's own tests stub fetch; this doesn't.
#
#   npm run demo:verify                 # whatever branch ~/ridgeline-demo/bet-slip has checked out
#   npm run demo:verify -- <branch>     # check out that run branch first (e.g. tkt-2481/before-...)
#
# Local rehearsal: Passport doesn't proxy localhost, so when .env holds {{vault:...}} references and the sandbox is
# local, the slip runs with the matching raw keys from .env.local in a temp file. On stage (Vercel + Passport
# proxy) the slip runs with its own .env, unchanged.
set -euo pipefail
cd "$(dirname "$0")/.."
REPO=$(pwd)
DEMO_DIR=${DEMO_DIR:-$HOME/ridgeline-demo/bet-slip}
SLIP_PORT=${SLIP_PORT:-4200}
[ -d "$DEMO_DIR/.git" ] || { echo "No run copy at $DEMO_DIR. Run npm run demo:before first."; exit 1; }
[ -n "${1:-}" ] && git -C "$DEMO_DIR" checkout -q "$1"
echo "Verifying $(git -C "$DEMO_DIR" branch --show-current) in $DEMO_DIR"

BASE=$(sed -n 's/^SANDBOX_BASE_URL=//p' "$DEMO_DIR/.env")
TMP=$(mktemp -d)
trap '[ -n "${SLIP_PID:-}" ] && kill "$SLIP_PID" 2>/dev/null; rm -rf "$TMP"' EXIT
ENV_FILE="$DEMO_DIR/.env"
if grep -q '{{vault:' "$DEMO_DIR/.env" && [[ "$BASE" == http://localhost* ]]; then
  # {{vault:RIDGELINE_PLAYER_LIMITS_KEY}} -> $API_KEY_PLAYER_LIMITS from .env.local
  set -a; . ./.env.local; set +a
  while IFS= read -r line; do
    if [[ "$line" =~ ^([A-Z_]+)=\{\{vault:RIDGELINE_([A-Z_]+)_KEY\}\}$ ]]; then
      var="API_KEY_${BASH_REMATCH[2]}"; echo "${BASH_REMATCH[1]}=${!var}"
    else echo "$line"; fi
  done < "$DEMO_DIR/.env" > "$TMP/slip.env"
  ENV_FILE="$TMP/slip.env"
  echo "(local rehearsal: Passport references swapped for raw keys in a temp file, because Passport doesn't proxy localhost)"
fi

# Fresh sandbox state, so the ledger and claims checks start clean.
if [ -f .env.local ]; then set -a; . ./.env.local; set +a; fi
[ -n "${API_KEY_ADMIN:-}" ] && curl -fsS -X POST "$BASE/admin/v1/reset" -H "Authorization: Bearer $API_KEY_ADMIN" >/dev/null && echo "sandbox reset at $BASE"

(cd "$DEMO_DIR" && PORT=$SLIP_PORT exec node --env-file="$ENV_FILE" src/server.mjs) > "$TMP/slip.log" 2>&1 &
SLIP_PID=$!
for _ in $(seq 1 50); do curl -s -o /dev/null "localhost:$SLIP_PORT" && break; sleep 0.2; done
curl -s -o /dev/null "localhost:$SLIP_PORT" || { echo "bet-slip didn't start:"; cat "$TMP/slip.log"; exit 1; }
echo "bet-slip running on :$SLIP_PORT"
echo
# 1. The phantom wheel: endpoints the agent's code calls that don't exist in their owner's spec.
node scripts/phantom-check.mjs "$DEMO_DIR"
echo
# 2. The owning teams' acceptance suite, against the running bet-slip.
SANDBOX_BASE_URL=$BASE SLIP_URL="http://localhost:$SLIP_PORT" VERBOSE=1 node scripts/postman-test.mjs bet-slip-acceptance
