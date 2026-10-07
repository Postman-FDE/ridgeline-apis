# Bets API: integration notes

_Last updated: 2025-11-03 by the bet-slip team_

Place a bet:

```http
POST {SANDBOX_BASE_URL}/bets/v1/bets
Authorization: Bearer <BETS_KEY>
Content-Type: application/json

{
  "player_id": "P-1001",
  "selections": [{ "market_id": "MKT-ML-001", "outcome_id": "OUT-HAWKS" }],
  "stake": 10.00
}
```

`stake` is the wager in dollars (decimal). The response includes `bet_id`, `status` and `potential_payout`.
