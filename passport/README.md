# Passport setup for the Ridgeline Sandbox

**The model:** each API validates its own **defined key** (`API_KEY_*` env vars: `.env.local` locally, Vercel env vars in production). Those keys live **only** in your vault. Passport maps each one to a reference, and every client ((demo/bet-slip, Postman, the Astropods agent)) holds only `{{vault:<reference>}}`. The Secure Access Proxy swaps in the real key at call time.

| Service | Vault path (default) | Reference name | Header |
|---|---|---|---|
| markets | `ridgeline/markets` | `RIDGELINE_MARKETS_KEY` | `Authorization: Bearer {{vault:RIDGELINE_MARKETS_KEY}}` |
| wallet | `ridgeline/wallet` | `RIDGELINE_WALLET_KEY` | `Authorization: Bearer {{vault:RIDGELINE_WALLET_KEY}}` |
| promotions | `ridgeline/promotions` | `RIDGELINE_PROMOTIONS_KEY` | `Authorization: Bearer {{vault:RIDGELINE_PROMOTIONS_KEY}}` |
| player-limits | `ridgeline/player-limits` | `RIDGELINE_PLAYER_LIMITS_KEY` | `Authorization: Bearer {{vault:RIDGELINE_PLAYER_LIMITS_KEY}}` |
| bets | `ridgeline/bets` | `RIDGELINE_BETS_KEY` | `Authorization: Bearer {{vault:RIDGELINE_BETS_KEY}}` |
| geo-compliance | `ridgeline/geo-compliance` | `RIDGELINE_GEO_COMPLIANCE_KEY` | `Authorization: Bearer {{vault:RIDGELINE_GEO_COMPLIANCE_KEY}}` |

## Steps

**1. Vault** (HashiCorp, AWS Secrets Manager or Google Cloud Secret Manager):
```bash
passport/vault-seed.sh hashicorp      # or aws | gcp
```

**2. Proxy:** use the Passport-enabled tenant's existing Secure Access Proxy (Helm on Kubernetes, registered under Org Settings > Access proxies, with the vault provider attached).

**3. Namespace + resources (Admin):**
- Create the **Ridgeline Sandbox** namespace.
- **Vault tab → Create vault reference** for each row above (reference name → vault path).
- **Add resources → API spec**: import `specs/*.openapi.json`. Or run:
  ```bash
  SANDBOX_HOST=your-project.vercel.app PASSPORT_NAMESPACE_ID=<id> PASSPORT_ADMIN_KEY=sk_... node passport/register.mjs          # dry run
  SANDBOX_HOST=your-project.vercel.app PASSPORT_NAMESPACE_ID=<id> PASSPORT_ADMIN_KEY=sk_... node passport/register.mjs --apply
  ```
  Endpoints are `method + host + /<service>/v1/...` (see `endpoints.json`), with the `Authorization` slot bound to the service's reference.
- Group the endpoints into **one resource group per service** (Markets API, Player Limits API, …). That's what developers request.

**4. Developer machine:**
```bash
passport login
passport setup --management-url <management_url> --proxy-url <proxy_url>:8443
cp passport/daemon.yml ~/.postman/access-proxy/daemon.yml     # set your Vercel host first
passport whoami                                                # shows allowedApiRefs and the {{vault:...}} form to use
```

**5. Demo flow:**
1. **Before:** `npm run grep` finds raw keys in `demo/bet-slip/.env` and in an agent transcript.
2. **Request:** Resources → **Player Limits API** → Request access. Choose the shortest duration and add a reason ("TKT-2481 championship boost").
3. **Approve** as the owner (Team Responsible Gaming) in the second browser profile.
4. **Swap:** `cp demo/bet-slip/.env.passport demo/bet-slip/.env`, then `passport whoami` to show the reference.
5. **Call:** `curl -s -X POST https://your-project.vercel.app/player-limits/v1/eligibility/check -H 'Authorization: Bearer {{vault:RIDGELINE_PLAYER_LIMITS_KEY}}' -H 'content-type: application/json' -d '{"player_id":"P-1003","product":"sportsbook"}' | jq`
6. **Audit:** proxy console (`<management_url>/console`) or `passport logs --json`.
7. **Revoke:** Governance → Revoke. Re-run step 5, and the call fails.

## Gotchas (from the docs and earlier rehearsals)
- **`localhost` bypasses the proxy** (`NO_PROXY`). Always call the Vercel hostname.
- **Exact matching:** method, host and path must match the grant. The APIs use fixed paths (no path params) for this reason. Query strings (`?event_id=`) are on GET list endpoints only.
- **Short identity TTL:** if a call suddenly 401s mid-demo, re-run `passport whoami` before debugging. "That's the TTL doing its job."
- **Node `fetch`** may need `NODE_USE_ENV_PROXY=1` (or `node --use-env-proxy`) to honor `HTTPS_PROXY`. Bun's fetch honors it.
- **Transcripts outlive the fix:** after the `.env` swap, `grep-secrets.sh` still finds the key in the old agent transcript. Say so on stage. That's why you rotate.
- The `{{passport:...}}` form in one older blog post is outdated. Use `{{vault:...}}`.
