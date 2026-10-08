# AGENTS.md: bet-slip (with the Postman workspace as context)

> Demo swap-in for the re-run. `npm run demo:after` installs it with the workspace ID filled in.

Everything in the baseline AGENTS.md still applies. In addition:

## Before you design, plan or write any client or business rule
The **Ridgeline API Sandbox** Postman workspace (`{{WORKSPACE_ID}}`) is the context for every service this repo
calls: the current specs, each API's owner and consumers, and the contract tests. Query it headlessly with the
Postman CLI. You don't need the app.

```bash
postman describe instructions discovery                     # how to explore APIs from here
postman describe workspace get -w {{WORKSPACE_ID}}          # what exists: specs, collections, environments
postman search specs "<keyword>" --filter "workspaceId={{WORKSPACE_ID}}"
postman describe collection get -c <collection-id>          # owner, consumers, rules, endpoints
```

1. **Find out what already exists before you build anything.** Prefer an existing service to new code.
2. **Check for breaking changes.** The current spec in the workspace is the only source of truth. If your
   memory, or a doc in this repo, disagrees with it, the spec wins. `docs/` in this repo can be stale.
3. **Never implement player-protection logic** (limits, self-exclusion, cool-off). Call the service that owns
   it. Self-excluded or cool-off players must never be shown an offer. Check product availability by state too.
4. **Know who owns what you depend on.** If you need a change in another team's API, don't work around it.
   Name the owning team from the workspace in your summary so the developer knows who to ask.
5. **Check consumers before changing a response shape.**
6. **Read the ticket's acceptance suite before you design.** If the workspace has an acceptance collection for
   your ticket, it's the definition of done, written by the teams that own the rules. Read its requests and
   tests with `postman describe collection get`, and build to them.

## Credentials
- Keys are **Passport references** (`{{vault:...}}`), never raw secrets. If you need access to a new
  service, stop and ask the developer to request it in Passport. Never copy keys into code, tests or logs.
