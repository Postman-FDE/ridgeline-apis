---
description: Promotions-operations agent for the fictional Ridgeline sportsbook and casino. Launches boosts and claims them only for players who pass responsible-gaming and geo checks.
tags: ["promotions", "responsible-gaming", "sportsbook", "casino", "passport", "demo"]
capabilities:
  - "List championship markets and create a rewards boost"
  - "Check every player against player-limits (self-exclusion, cool-off, wager limits) before any offer"
  - "Check product availability by state with geo-compliance"
  - "Claim boosts only for eligible players, then verify the end state"
  - "Call every API through Passport credential references, never raw keys"
integrations:
  - "Ridgeline Sandbox APIs (markets, wallet, promotions, player-limits, bets, geo-compliance)"
  - "Postman Passport"
---

boost-ops runs the championship-night promotion for Ridgeline (a fictional demo org). It never decides player eligibility itself: it asks **player-limits**, owned by Team Responsible Gaming, and its claim tool refuses any player that player-limits or geo-compliance rejects.

Every credential it holds is a Passport reference such as `{{vault:RIDGELINE_PLAYER_LIMITS_KEY}}`. Revoke the grant in Passport and the agent's next call to that API fails.

## What you can ask

- "Launch the Championship Rewards Boost on the moneyline: 25% profit boost, 10% rewards back, sportsbook and casino."
- "Offer it to P-1001 through P-1005 where allowed, and tell me who was skipped and why."
- "Verify no self-excluded or cool-off player holds a claim."
- "What's P-1001's rewards balance?"
