# Stage runbook: the 30-minute talk

Maps each segment of the 30-minute talk outline to the commands and screens in this repo.

| Time | Segment | Do | Say |
|---|---|---|---|
| 0:00 | Cold open | In `demo/bet-slip`, start the coding agent with `TICKET.md` and the **baseline** `AGENTS.md` | "Good AGENTS.md, repo search, GitHub MCP. The setup most of you have." |
| 3:00 | Review the PR | Show the diff. It (1) writes its own limit check, with no self-exclusion, (2) uses `stake: 10.0` from the stale `docs/bets-api.md`, (3) relies on raw keys in `.env` | "Would you merge this?" Then reveal the traps one at a time |
| 8:00 | **Find** | Postman **API Catalog**: search "limit" → player-limits (owner, spec, readiness, monitors). bets spec history `stake` → `stake_minor`. sportsbook-app as a consumer. Then ask the agent via the Postman MCP/CLI | "Same agent, same model. The only thing that changed is what it can see." |
| 13:00 | **Reach**: the problem | `npm run grep` | "Where's the key right now?" |
| 14:00 | **Reach**: Passport | Request access to the **Player Limits API** → approve as Team RG → `cp .env.passport .env` → `passport whoami` | "I didn't have to Slack anyone for a key." |
| 16:00 | **Reach**: the agent that moves money | `cd demo/agent && bun agent/local.ts`: boost-ops skips P-1003 (self-excluded) and P-1005 (cool-off), and offers sportsbook only in NY. Show the audit (proxy console or `passport logs --json`) | "The agent never saw a key, and it can't skip player-limits." |
| 18:30 | **Reach**: revoke | Owner revokes the player-limits grant → re-run boost-ops (or curl) → it fails and reports lost access → re-grant. Then `npm run grep`: `.env` is clean, but the old transcript still leaks | Pause on the revoke. "Transcripts outlive the fix. Rotate." |
| 21:00 | Re-run | `cp AGENTS.postman.md AGENTS.md`, re-run the same ticket (or the recorded fast-forward). Then run the **E2E collection**: 13 green assertions, ending with "no claim for self-excluded P-1003" (Ridgeline · Championship Rewards Boost (E2E)) | "Would you merge it now?" |

## Pre-flight (T-30 min)
- [ ] Sandbox deployed on its stable Vercel domain. `SANDBOX_BASE_URL=https://<host> npm run smoke` all PASS. `npm run reset` run (with API_KEY_ADMIN set)
- [ ] `passport whoami` valid. Player-limits grant **revoked** (so it can be requested live). Other grants approved
- [ ] Owner browser profile open on **Approval requests**
- [ ] `demo/bet-slip/.env` = raw keys (the "before" state, from `npm run demo:env`)
- [ ] Postman: Ridgeline Sandbox workspace, the Passport environment selected, Catalog tab open on search
- [ ] Recorded fallbacks for: the cold-open run, the re-run, the revoke
- [ ] Terminal at 16pt+, notifications off, `jq` installed
