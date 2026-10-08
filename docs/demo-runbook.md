# Stage runbook: the 30-minute talk

Maps each segment of the talk outline to the commands and screens in this repo. The frame: **the AI SDLC is design, plan, implement, verify. Agents made implement cheap. Design and plan need context that isn't in the repo.** The Postman workspace is that context, queried headlessly. Passport handles the secrets.

## The sandbox: gateway mode

Run the sandbox as an API gateway for the before run: `npm run local -- --gateway` locally, or point the bet-slip at an `api.<domain>` alias on Vercel. The host then serves the APIs and `/healthz` only; the docs page, `/specs` and `/postman` return 404. Without it, the before-run agent reads the specs off the host (a rehearsal run did, with `node -e fetch`). `npm run demo:before` refuses to start when the host serves specs.

## Reset

```bash
npm run demo:before   # fresh isolated bet-slip at ~/ridgeline-demo/bet-slip, new branch tkt-2481/before-<time>, traps verified
npm run demo:after    # same baseline + the Postman AGENTS.md + Passport refs, new branch tkt-2481/after-<time>
```

The run copy lives outside this repo on purpose. Started inside `demo/bet-slip`, the agent reads `../../public/specs` and skips every trap. An earlier run rewrote `docs/bets-api.md` from the spec. Launch the before run with the exact command the script prints: `--strict-mcp-config --disallowedTools ...` blocks the Postman CLI, Passport, MCP and web access, because your user-level config has them. It's a flag, not a settings file, because the agent reads the repo and a deny list that names Postman is itself a hint. Each run is a branch, so `git -C ~/ridgeline-demo/bet-slip branch` lists every rehearsal.

## Run of show

Four acts: the demo, the problem, how we fix it, the aha. Times match `outline.md`.

| Time | Act | Do | Say |
|---|---|---|---|
| 0:00 | 1 · Cold open | Sandbox running realistic (`npm run local -- --gateway --terse-errors`). `npm run demo:before`, then in `~/ridgeline-demo/bet-slip` the `claude` command it prints, with *"Implement TICKET.md."* | "Good AGENTS.md, repo search, a frontier model. The setup most of you have." |
| 3:00 | 1 · Review, path A | It stopped: read its questions. Reply: *"It's a P1 and the API owners are offline. Make reasonable assumptions, mark them clearly, and implement it."* | "Who here could answer all of these in under an hour?" |
| 4:30 | 1 · Review | Read its numbered `ASSUMPTION`s. `npm test` green | "Would you merge this?" |
| 5:00 | 1 · Verify | `npm run demo:verify`: the phantom check (`✗ wallet … /limits` ↳ the real one: player-limits), then the acceptance suite, red | "Its tests passed. Theirs didn't. It assumed the wheel exists and guessed where it lives." |
| 7:00 | 2 · Start the after run | Second terminal: `npm run demo:after`, then `claude "Implement TICKET.md."`. Leave it | "Same model, same ticket. One thing changed." |
| 7:00 | 2 · The problem | 4 slides: the thesis, is reinventing still a problem, the AI SDLC and the spec, the evidence | "It knew what it didn't know. It couldn't know self-exclusion exists." |
| 11:00 | 3a · The map | `postman search specs limits`, `postman describe collection get -c 50798902-0db61863-8817-4c16-9fdc-3726719da426` (player-limits), bets v1 → v2 and its error table, `postman describe collection get -c 50798902-c892d3c4-499d-4d95-8b47-91705dbc813f` (the acceptance suite), the AGENTS.md block | "The API said Bad Request. The spec says why." |
| 15:00 | 3b · Keep it true | `postman workspace lint` (clean), then `npm run test:postman -- sportsbook-app-contract`: **expected red** on `error names the replacement field`, because the terse sandbox returns a bare "Bad Request" | "The consumer made a good error message a test. The terse API breaks it, and CI catches it." |
| 16:30 | 3c · Passport | `DEMO_DIR=~/ridgeline-demo/bet-slip npm run grep` → request access → approve as Team RG → `passport whoami` → revoke → re-grant | "The agent never holds the key." |
| 21:00 | 4 · The aha | Scroll to its `postman describe` calls. `npm run demo:verify`: no phantoms, 19 of 19 green. `git diff baseline-after` | "Same agent, same model, same ticket, same tests. Would you merge it now?" |

Path B (it guessed straight away): skip the reply at 3:00 and go to its assumptions.

The sandbox runs **realistic** for the demo: `--gateway` hides the docs page, specs and collections, and `--terse-errors` makes every error body status text only. Without terse errors, the bets API's helpful 400 teaches the agent `stake_minor`, and an unknown-service 404 lists every API. If the after run hasn't finished by 21:00, use the recorded fast-forward.

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
