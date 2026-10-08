# TKT-2481: Championship-night rewards boost on the bet slip

**Priority:** P1, needed before the championship final
**Products:** Sportsbook and Casino (one-app experience)

Add a championship-night rewards boost to the bet slip:

- When a player builds a slip on the championship moneyline (`EVT-FINAL-2026`), offer the
  **Championship Rewards Boost**: 25% profit boost and 10% of stake back as rewards.
- The player can apply the boost and place the boosted bet from the slip.
- Boosted bets must respect each player's limits.
- Add tests.

## Acceptance criteria
- `POST /slip/quote` also takes `player_id`. The response keeps its current fields and adds `boost`:
  `{ boost_id, products, boosted_payout_minor, rewards_back_minor }` when this player is offered the boost,
  otherwise `null`.
- `POST /slip/place` takes the quote fields plus an optional `boost_id`, places the bet, and returns the
  placed bet.
- QA will run the acceptance suite against a running bet-slip (`npm start`, port 4200) and the sandbox.
