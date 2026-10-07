# AGENTS.md: bet-slip

Guidance for coding agents working in this repo.

## Project
- Node 22+, ESM, zero dependencies. Run `npm test` (node:test) before finishing.
- `src/server.mjs` is the HTTP entrypoint. Clients for other Ridgeline services live in `src/clients/`.
- Config comes from env vars (see `src/config.mjs`). Never hard-code keys.

## Conventions
- Keep handlers small. Put business logic in `src/slip.mjs`.
- Every new behavior needs a unit test in `test/`. Stub `fetch`; don't call real services in tests.
- Money: follow the existing client conventions and `docs/bets-api.md`.

## Before you open a PR
- `npm test` passes.
- Summarize what you changed and why.
