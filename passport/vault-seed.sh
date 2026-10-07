#!/usr/bin/env bash
# Put the API keys from .env.local into the secret store Passport resolves from.
# Supported by Passport: HashiCorp Vault, AWS Secrets Manager, Google Cloud Secret Manager.
# Usage:  passport/vault-seed.sh hashicorp|aws|gcp
set -euo pipefail
cd "$(dirname "$0")/.."
STORE="${1:-hashicorp}"
PREFIX="${SANDBOX_VAULT_PREFIX:-ridgeline}"
[ -f .env.local ] || { echo "No .env.local. Run: npm run keys > .env.local"; exit 1; }
grep -E '^API_KEY_(MARKETS|WALLET|PROMOTIONS|PLAYER_LIMITS|BETS|GEO_COMPLIANCE)=' .env.local | while IFS='=' read -r name value; do
  svc=$(echo "${name#API_KEY_}" | tr 'A-Z_' 'a-z-')
  path="$PREFIX/$svc"
  ref="RIDGELINE_${name#API_KEY_}_KEY"
  case "$STORE" in
    hashicorp) vault kv put "secret/$path" value="$value" >/dev/null ;;
    aws)       aws secretsmanager create-secret --name "$path" --secret-string "$value" >/dev/null 2>&1 \
                 || aws secretsmanager put-secret-value --secret-id "$path" --secret-string "$value" >/dev/null ;;
    gcp)       printf '%s' "$value" | gcloud secrets create "${path//\//-}" --data-file=- >/dev/null 2>&1 \
                 || printf '%s' "$value" | gcloud secrets versions add "${path//\//-}" --data-file=- >/dev/null ;;
    *) echo "unknown store: $STORE"; exit 1 ;;
  esac
  echo "stored $svc -> $STORE:$path   (Passport reference name: $ref)"
done
