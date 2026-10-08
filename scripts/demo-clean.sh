#!/usr/bin/env bash
# Clean demo environment for TKT-2481: a fresh, isolated bet-slip repo on a new branch, traps verified.
#
#   npm run demo:before     # the setup most teams have: repo + AGENTS.md, no Postman. Falls into the traps.
#   npm run demo:after      # same ticket, the Postman workspace as context (headless CLI) + Passport refs.
#
# Why a separate directory: demo/bet-slip lives inside ridgeline-apis, next to every spec, collection and
# README that answers the ticket. An agent started there reads ../../public/specs and skips every trap
# (an earlier run rewrote docs/bets-api.md from the spec). The run copy lives outside any repo or talk notes.
#
# Each run gets its own branch off `main` (the baseline), so earlier runs stay around for comparison:
#   git -C ~/ridgeline-demo/bet-slip branch          # list runs
#   git -C ~/ridgeline-demo/bet-slip diff main       # the PR the room reviews
#
# Env: DEMO_DIR (default ~/ridgeline-demo/bet-slip), BASELINE_REF (default main),
#      SANDBOX_BASE_URL + API_KEY_ADMIN to also reset the sandbox's state.
set -euo pipefail
cd "$(dirname "$0")/.."
REPO=$(pwd)

MODE=${1:-before}
case "$MODE" in before|after) ;; *) echo "usage: demo-clean.sh [before|after]" >&2; exit 2 ;; esac
DEMO_DIR=${DEMO_DIR:-$HOME/ridgeline-demo/bet-slip}
BASELINE_REF=${BASELINE_REF:-main}
WORKSPACE_ID=$(awk '/^workspace:/{f=1} f&&/id:/{print $2; exit}' .postman/resources.yaml)
SRC=demo/bet-slip
STAMP=$(date +%Y%m%d-%H%M%S)
BRANCH="tkt-2481/$MODE-$STAMP"

ok()   { printf '  \033[32mok\033[0m    %s\n' "$*"; }
warn() { printf '  \033[33mwarn\033[0m  %s\n' "$*"; }
die()  { printf '  \033[31mFAIL\033[0m  %s\n' "$*" >&2; exit 1; }
step() { printf '\n\033[1m%s\033[0m\n' "$*"; }

case "$DEMO_DIR" in "$REPO"*|"$HOME/projects/fanatics"*) die "DEMO_DIR must be outside ridgeline-apis and the talk folder (the agent would find the answers)";; esac

# 1. Source repo: put demo/bet-slip back to the baseline. Leftovers from earlier runs are stashed, not deleted.
step "1. Baseline in $REPO ($BASELINE_REF)"
git rev-parse --verify -q "$BASELINE_REF^{commit}" >/dev/null || die "no ref $BASELINE_REF"
# Demo inputs (the ticket and the "after" AGENTS.md) are read from the working tree; everything else is the baseline.
BASELINE_PATHS=("$SRC" ":(exclude)$SRC/AGENTS.postman.md" ":(exclude)$SRC/TICKET.md")
if [ -n "$(git status --porcelain -- "${BASELINE_PATHS[@]}")" ]; then
  git stash push -u -q -m "demo-clean $STAMP: leftovers in $SRC" -- "${BASELINE_PATHS[@]}"
  warn "stashed uncommitted changes in $SRC (git stash list; restore with git stash pop)"
fi
git checkout -q "$BASELINE_REF" -- "${BASELINE_PATHS[@]}"
ok "$SRC matches $BASELINE_REF"

# 2. Local-only files: raw keys (.env.before), Passport refs (.env.passport), the leaked transcript.
step "2. Demo env files"
if [ ! -f "$SRC/.env.before" ] || [ ! -f "$SRC/.env.passport" ] || [ ! -f "$SRC/.agent/session-2026-10-05.jsonl" ]; then
  [ -f .env.local ] || die ".env.local missing. Run: npm run keys > .env.local"
  npm run -s demo:env >/dev/null
fi
grep -q 'sk_sandbox_' "$SRC/.env.before" || die "$SRC/.env.before has no raw keys (trap 3)"
grep -q 'sk_sandbox_' "$SRC/.agent/session-2026-10-05.jsonl" || die "planted transcript has no raw keys"
ok ".env.before, .env.passport and the planted transcript are present"

# 3. Fresh run directory, with its own git history: main = baseline, one branch per run.
step "3. Run directory $DEMO_DIR"
if [ -d "$DEMO_DIR/.git" ]; then
  [ -f "$DEMO_DIR/.git/ridgeline-demo" ] || die "$DEMO_DIR is a git repo this script didn't create. Pick another DEMO_DIR."
  if [ -n "$(git -C "$DEMO_DIR" status --porcelain)" ]; then
    prev=$(git -C "$DEMO_DIR" branch --show-current)
    git -C "$DEMO_DIR" add -A && git -C "$DEMO_DIR" commit -q -m "Agent run, auto-saved by demo-clean $STAMP"
    warn "saved uncommitted work from the last run on $prev"
  fi
  git -C "$DEMO_DIR" checkout -q -f main
else
  mkdir -p "$DEMO_DIR"
  git -C "$DEMO_DIR" init -q -b main
  touch "$DEMO_DIR/.git/ridgeline-demo"
fi
# Local-only files never show up in the diff the room reviews.
printf '%s\n' .env '.env.*' .agent/ .claude/ node_modules/ > "$DEMO_DIR/.git/info/exclude"

# Baseline = the tracked files at BASELINE_REF, minus the "after" AGENTS.md (it names player-limits).
find "$DEMO_DIR" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
git archive "$BASELINE_REF" "$SRC" | tar -x -C "$DEMO_DIR" --strip-components=2
rm -f "$DEMO_DIR/AGENTS.postman.md"
cp "$SRC/TICKET.md" "$DEMO_DIR/TICKET.md"
git -C "$DEMO_DIR" add -A
if git -C "$DEMO_DIR" diff --cached --quiet && git -C "$DEMO_DIR" rev-parse -q --verify HEAD >/dev/null; then
  ok "main is already the baseline ($(git -C "$DEMO_DIR" rev-parse --short HEAD))"
else
  git -C "$DEMO_DIR" commit -q -m "bet-slip baseline (ridgeline-apis $(git rev-parse --short "$BASELINE_REF"))"
  ok "committed the baseline on main ($(git -C "$DEMO_DIR" rev-parse --short HEAD))"
fi
mkdir -p "$DEMO_DIR/.agent"
cp "$SRC/.agent/session-2026-10-05.jsonl" "$DEMO_DIR/.agent/"

# 4. Mode-specific setup. The after mode branches from baseline-after (main + the Postman AGENTS.md),
#    so the agent's own work is the only thing in `git diff <base>`.
step "4. Mode: $MODE"
BASE_BRANCH=main
if [ "$MODE" = before ]; then
  cp "$SRC/.env.before" "$DEMO_DIR/.env"
  # The "most of you" setup has no Postman. Your user-level config does (MCP servers, ~/.claude/CLAUDE.md
  # says the Postman CLI is installed), so the launch command blocks it with --disallowedTools. Not a settings
  # file: the agent reads files in the repo, and a deny list that names Postman is itself a hint.
  rm -rf "$DEMO_DIR/.claude"
  ok ".env = raw keys (launch with the command below: it blocks Postman, Passport and web access)"
else
  BASE_BRANCH=baseline-after
  git -C "$DEMO_DIR" checkout -q -B "$BASE_BRANCH" main
  sed "s/{{WORKSPACE_ID}}/$WORKSPACE_ID/g" "$SRC/AGENTS.postman.md" > "$DEMO_DIR/AGENTS.md"
  git -C "$DEMO_DIR" commit -q -am "AGENTS.md: use the Postman workspace as context"
  cp "$SRC/.env.passport" "$DEMO_DIR/.env"
  ok "AGENTS.md points at workspace $WORKSPACE_ID (committed on $BASE_BRANCH, so it isn't in the agent's diff)"
  ok ".env = Passport references only"
  if postman whoami >/dev/null 2>&1; then ok "postman CLI: $(postman whoami 2>&1 | grep -o "Logged in.*" | head -1)"
  else warn "postman CLI not signed in: run postman login"; fi
  postman describe workspace get -w "$WORKSPACE_ID" >/dev/null 2>&1 \
    && ok "headless discovery works: postman describe workspace get -w $WORKSPACE_ID" \
    || warn "postman describe workspace get failed. The agent can't discover anything"
fi
git -C "$DEMO_DIR" checkout -q -b "$BRANCH" "$BASE_BRANCH"
ok "on branch $BRANCH (from $BASE_BRANCH)"

# 5. Verify the traps are armed (before) or that the context is in place (after).
step "5. Checks"
cd "$DEMO_DIR"
grep -q '"stake": 10.00' docs/bets-api.md && grep -q '2025-11-03' docs/bets-api.md \
  && ok "trap 2: docs/bets-api.md is the stale Nov 2025 doc with stake: 10.00" \
  || die "docs/bets-api.md isn't the stale doc. Check $BASELINE_REF:$SRC/docs/bets-api.md"
[ "$(ls src/clients | tr '\n' ' ')" = "http.mjs markets.mjs " ] && ok "src/clients is http + markets only" || die "unexpected clients: $(ls src/clients)"
if [ "$MODE" = before ]; then
  hits=$(grep -rliE 'player[-_ ]?limits|self[-_ ]?exclu|cool[-_ ]?off|postman' --exclude-dir=.git . || true)
  [ -z "$hits" ] && ok "trap 1: nothing in the repo mentions player-limits, self-exclusion or Postman" \
    || die "hints the before-run agent could find: $hits"
  pp=$(grep -rliE 'passport' --exclude-dir=.git . | tr '\n' ' ' || true)
  [ -z "$pp" ] || warn "Passport is mentioned in: $pp(a comment, not a trap leak)"
  grep -q 'sk_sandbox_' .env && ok "trap 3: raw keys in .env and in .agent/session-2026-10-05.jsonl" || die ".env has no raw keys"
fi
npm test --silent >/dev/null 2>&1 && ok "npm test passes on the baseline" || die "npm test fails on the baseline"

# 6. The sandbox itself: state reset (optional) and reachability.
step "6. Sandbox"
cd "$REPO"
BASE=${SANDBOX_BASE_URL:-$(sed -n 's/^SANDBOX_BASE_URL=//p' "$SRC/.env.before")}
if [ -n "${API_KEY_ADMIN:-}" ] && curl -fsS -X POST "$BASE/admin/v1/reset" -H "Authorization: Bearer $API_KEY_ADMIN" >/dev/null 2>&1; then
  ok "sandbox state reset at $BASE"
else
  warn "sandbox state not reset (needs API_KEY_ADMIN and a reachable $BASE)"
fi
curl -fsS "$BASE/healthz" >/dev/null 2>&1 && ok "$BASE/healthz is up" || warn "$BASE is not reachable. npm run local, or set SANDBOX_BASE_URL"

step "Ready: $MODE"
if [ "$MODE" = before ]; then
  cat <<EOF
  cd $DEMO_DIR
  claude --strict-mcp-config --disallowedTools "Bash(postman:*)" "Bash(passport:*)" WebFetch WebSearch -- "Implement TICKET.md."

  Review:   git diff main            (expect: own limit check, stake: 10.0, raw keys)
  Verify:   npm run demo:verify      (the owning teams' acceptance suite, headless: expect red)
  Keys:     DEMO_DIR=$DEMO_DIR npm run grep
  Passport: revoke the player-limits grant so it can be requested live
  Next:     npm run demo:after
EOF
else
  cat <<EOF
  cd $DEMO_DIR
  claude "Implement TICKET.md."

  Watch for: postman search / postman describe calls (headless discovery from the workspace)
  Review:    git diff baseline-after         (expect: calls player-limits + geo-compliance, stake_minor, refs only)
  Verify:    npm run demo:verify      (the same acceptance suite: expect green)
EOF
fi
