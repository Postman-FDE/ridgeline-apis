#!/usr/bin/env bash
# Push the API keys from .env.local to Vercel (production + preview), as sensitive env vars.
# Requires the Vercel CLI (npm i -g vercel) and `vercel link` in this folder.
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f .env.local ] || { echo "No .env.local. Run: npm run keys > .env.local"; exit 1; }
grep -E '^API_KEY_[A-Z_]+=.+' .env.local | while IFS='=' read -r name value; do
  for target in production preview; do
    vercel env rm "$name" "$target" -y >/dev/null 2>&1 || true
    printf '%s' "$value" | vercel env add "$name" "$target" --sensitive >/dev/null
  done
  echo "set $name (production, preview)"
done
echo "Done. Redeploy for the new values to take effect: vercel --prod"
