# Stage runbook: the 30-minute talk

Maps each segment of the talk outline to the commands and screens in this repo. The frame: **the AI SDLC is design, plan, implement, verify. Agents made implement cheap. Design and plan need context that isn't in the repo.** The Postman workspace is that context, queried headlessly. Passport handles the secrets.

## Reset

```bash
npm run demo:before   # fresh isolated bet-slip at ~/ridgeline-demo/bet-slip, new branch tkt-2481/before-<time>, traps verified
npm run demo:after    # same baseline + the Postman AGENTS.md + Passport refs, new branch tkt-2481/after-<time>
```

The run copy lives outside this repo on purpose. Started inside `demo/bet-slip`, the agent reads `../../public/specs` and skips every trap. An earlier run rewrote `docs/bets-api.md` from the spec. Launch the before run with the exact command the script prints: `--strict-mcp-config --disallowedTools ...` blocks the Postman CLI, Passport, MCP and web access, because your user-level config has them. It's a flag, not a settings file, because the agent reads the repo and a deny list that names Postman is itself a hint. Each run is a branch, so `git -C ~/ridgeline-demo/bet-slip branch` lists every rehearsal.

## Run of show

| Time | Segment | Do | Say |
|---|---|---|---|
| 0:00 | Cold open | `npm run demo:before`, then in `~/ridgeline-demo/bet-slip` the `claude` command it prints, with *"Implement TICKET.md."* | "Good AGENTS.md, repo search, a frontier model. The setup most of you have." |
| 3:00 | Review, path A (it stopped) | Read its questions. Then reply: *"It's a P1 and the API owners are offline. Make reasonable assumptions, mark them clearly, and implement it."* | "Who here could answer all four in under an hour?" |
| 4:30 | Review, its assumptions | Read the numbered `ASSUMPTION`s. `npm test` green | "Would you merge this?" |
| 5:00 | **Aha 1** | `postman describe collection get -c 50798902-9cc42ac2-aa4b-4cd1-81e1-3f0fb4bf92e3` (promotions): "Does not check responsible gaming. Callers must." Then `grep -ri exclu src` (empty) | "Its first assumption is backwards. It knew what it didn't know. It couldn't know self-exclusion exists." |
| 6:00 | **Aha 2** | `npm run demo:verify`: red (9 of 19 in rehearsal), incl. bets' own "`stake` was removed" message | "Its tests passed. Theirs didn't." |
| 8:00 | Start the after run | Second terminal: `npm run demo:after`, then `claude "Implement TICKET.md."`. Leave it | "Same model, same ticket. One thing changed." |
| 10:00 | **The workspace, headless** | `postman search specs limits`, `postman describe collection get -c 50798902-0db61863-8817-4c16-9fdc-3726719da426` (player-limits: owner, consumers), bets v1 → v2 in the app, `postman describe collection get -c 50798902-c892d3c4-499d-4d95-8b47-91705dbc813f` (the acceptance suite) | "Discover the breaking change before you reinvent the API." |
| 15:00 | **Passport** | `DEMO_DIR=~/ridgeline-demo/bet-slip npm run grep` → request access → approve as Team RG → `passport whoami` → (optional boost-ops) → revoke → re-grant | "The agent never holds the key." |
| 21:00 | **The after run** | Scroll to its `postman describe` calls (35 in rehearsal). `git diff baseline-after`. Then `npm run demo:verify`: 19 of 19 green | "Would you merge it now?" |

Path B (it guessed straight away): skip the reply at 3:00 and go to its assumptions. If the after run hasn't finished by 21:00, use the recorded fast-forward.

`npm run demo:verify` starts the agent's bet-slip from the run copy on :4200, resets the sandbox, and runs **Ridgeline · bet-slip acceptance (TKT-2481)** with the Postman CLI. Locally it swaps Passport references for raw keys in a temp file, because Passport doesn't proxy localhost. Before and after share one run copy, so verify the before run *before* you start the after run (as scheduled above). `demo:after` saves the before run's work as a commit on its branch, and never pass a branch to `demo:verify` while an agent is working.

## Pre-flight (T-30 min)
- [ ] Sandbox up: deployed on its stable Vercel domain (`SANDBOX_BASE_URL=https://<host> npm run smoke` all PASS), or `npm run local` for a local-only rehearsal
- [ ] `npm run demo:before` all `ok`, and `npm run demo:verify` on a recorded before branch is red, on a recorded after branch green, with `SANDBOX_BASE_URL` and `API_KEY_ADMIN` set so the state reset runs
- [ ] `postman whoami` signed in. `postman describe workspace get -w d70d54a8-6efc-43f1-ad84-32090757737c` answers
- [ ] `passport whoami` valid. Player-limits grant **revoked** (so it can be requested live). Other grants approved
- [ ] Owner browser profile open on **Approval requests**
- [ ] Postman app: Ridgeline API Sandbox workspace, the bets spec open, the Passport environment selected
- [ ] Recorded fallbacks for: the cold-open run, the after run, the revoke
- [ ] Terminal at 16pt+, notifications off, `jq` installed
