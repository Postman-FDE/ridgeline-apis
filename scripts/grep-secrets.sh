#!/usr/bin/env bash
# Demo beat: "Where are the keys right now?" Finds raw sandbox keys in the demo repo and in agent transcripts.
# On a real laptop, also try ~/.claude and ~/.cursor.
set -euo pipefail
cd "$(dirname "$0")/.."
DEMO_DIR=${DEMO_DIR:-$HOME/ridgeline-demo/bet-slip}   # the run copy made by scripts/demo-clean.sh
echo "Searching for raw API keys (sk_sandbox_...) in the bet-slip repo and agent transcripts..."
targets=()
for t in "$DEMO_DIR/.env" "$DEMO_DIR/.agent" "$DEMO_DIR/src" "$DEMO_DIR/test" demo/agent/.env; do [ -e "$t" ] && targets+=("$t"); done
if [ ${#targets[@]} -gt 0 ] && hits=$(grep -rnoE 'sk_sandbox_[a-z]+_[0-9a-f]{6}' "${targets[@]}"); then
  printf '%s\n' "$hits" | sed -E "s|^$HOME|~|" | sed -E 's/(sk_sandbox_[a-z]+_[0-9a-f]{6})/\1… (raw key)/'
else
  echo "None found. Every client holds a Passport reference."
fi
echo
echo "On your own machine, tonight:  grep -rniE 'sk-|api[_-]?key|bearer ' ~/.claude ~/.cursor 2>/dev/null | head"
