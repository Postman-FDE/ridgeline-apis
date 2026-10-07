#!/usr/bin/env bash
# Reset to the "before" state between rehearsals.
set -euo pipefail
cd "$(dirname "$0")/.."
cp demo/bet-slip/.env.before demo/bet-slip/.env
if git -C demo/bet-slip rev-parse --git-dir >/dev/null 2>&1 && [ "$(git -C demo/bet-slip rev-parse --show-toplevel)" = "$(cd demo/bet-slip && pwd)" ]; then
  git -C demo/bet-slip checkout -- AGENTS.md src test && git -C demo/bet-slip clean -fdq src test
else
  echo "(demo/bet-slip is not its own git repo. Run once: cd demo/bet-slip && git init && git add -A && git commit -m baseline)"
fi
if [ -n "${SANDBOX_BASE_URL:-}" ] && [ -n "${API_KEY_ADMIN:-}" ]; then
  curl -fsS -X POST "$SANDBOX_BASE_URL/admin/v1/reset" -H "Authorization: Bearer $API_KEY_ADMIN" >/dev/null && echo "Sandbox state reset at $SANDBOX_BASE_URL"
fi
echo "Reset done. In Passport: revoke the player-limits grant so it can be requested live."
