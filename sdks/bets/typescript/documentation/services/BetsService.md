# BetsService

A list of all methods in the `BetsService` service. Click on the method name to view detailed information about that method.

| Methods                       | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| :---------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [betsGetBets](#betsgetbets)   | List bets, optionally for one `player_id`. **Errors** (with what a client or agent should do) \| Status \| `error` \| When \| Recoverable \| What to do \| \|---\|---\|---\|---\|---\| \| 400 \| `missing_fields` \| A required field is missing \| yes \| Fix the input: add the fields listed in `fields`, then retry. \| \| 401 \| `unauthorized` \| Missing key, or another API's key \| yes \| Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. \| \| 401 \| `unresolved_reference` \| A Passport reference skipped the proxy \| yes \| Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. \|                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| [betsPostBets](#betspostbets) | Place a bet. Send `stake_minor` in cents. To apply a boost, the player must have claimed it via promotions first. **Errors** (with what a client or agent should do) \| Status \| `error` \| When \| Recoverable \| What to do \| \|---\|---\|---\|---\|---\| \| 400 \| `unsupported_field` \| The request contains the removed v1 `stake` field. The error includes `"replacement": "stake_minor"`. \| yes \| Fix the input: rename the field to the one in `replacement` (e.g. `stake` to `stake_minor`, in cents). \| \| 400 \| `invalid_amount` \| `stake_minor` is not a positive integer. \| yes \| Fix the input: send a positive integer in cents (e.g. 1000), then retry. \| \| 403 \| `player_not_eligible` \| Player-limits rejected the wager. `reasons` lists why (e.g. `SELF_EXCLUDED`). \| no \| Stop: player protection blocked this. Do not retry, do not offer an alternative promotion, and report the `reasons`. \| \| 403 \| `product_not_available` \| The product is not available in the player's state. \| no \| Stop for this product: it is not available in the player's state. Another product may be. \| \| 404 \| `selection_not_found` \| Unknown `market_id` / `outcome_id`. \| yes \| Look up valid outcomes with markets `GET /v1/markets`, then retry. \| \| 409 \| `boost_not_claimed` \| `boost_id` given but the player has not claimed it. \| yes \| Check eligibility, claim the boost with promotions `POST /v1/boosts/claim`, then retry the bet. \| \| 400 \| `missing_fields` \| A required field is missing \| yes \| Fix the input: add the fields listed in `fields`, then retry. \| \| 401 \| `unauthorized` \| Missing key, or another API's key \| yes \| Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. \| \| 401 \| `unresolved_reference` \| A Passport reference skipped the proxy \| yes \| Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. \| |

## betsGetBets

List bets, optionally for one `player_id`. **Errors** (with what a client or agent should do) \| Status \| `error` \| When \| Recoverable \| What to do \| \|---\|---\|---\|---\|---\| \| 400 \| `missing_fields` \| A required field is missing \| yes \| Fix the input: add the fields listed in `fields`, then retry. \| \| 401 \| `unauthorized` \| Missing key, or another API's key \| yes \| Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. \| \| 401 \| `unresolved_reference` \| A Passport reference skipped the proxy \| yes \| Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. \|

- HTTP Method: `GET`
- Endpoint: `/v1/bets`

**Parameters**

| Name     | Type   | Required | Description       |
| :------- | :----- | :------- | :---------------- |
| playerId | string | ❌       | Filter by player. |

**Return Type**

`any`

**Example Usage Code Snippet**

```typescript
import { RidgelineBets } from 'ridgeline-bets';

(async () => {
  const ridgelineBets = new RidgelineBets({
    token: 'YOUR_TOKEN',
  });

  const data = await ridgelineBets.bets.betsGetBets({
    playerId: 'player_id',
  });

  console.log(data);
})();
```

## betsPostBets

Place a bet. Send `stake_minor` in cents. To apply a boost, the player must have claimed it via promotions first. **Errors** (with what a client or agent should do) \| Status \| `error` \| When \| Recoverable \| What to do \| \|---\|---\|---\|---\|---\| \| 400 \| `unsupported_field` \| The request contains the removed v1 `stake` field. The error includes `"replacement": "stake_minor"`. \| yes \| Fix the input: rename the field to the one in `replacement` (e.g. `stake` to `stake_minor`, in cents). \| \| 400 \| `invalid_amount` \| `stake_minor` is not a positive integer. \| yes \| Fix the input: send a positive integer in cents (e.g. 1000), then retry. \| \| 403 \| `player_not_eligible` \| Player-limits rejected the wager. `reasons` lists why (e.g. `SELF_EXCLUDED`). \| no \| Stop: player protection blocked this. Do not retry, do not offer an alternative promotion, and report the `reasons`. \| \| 403 \| `product_not_available` \| The product is not available in the player's state. \| no \| Stop for this product: it is not available in the player's state. Another product may be. \| \| 404 \| `selection_not_found` \| Unknown `market_id` / `outcome_id`. \| yes \| Look up valid outcomes with markets `GET /v1/markets`, then retry. \| \| 409 \| `boost_not_claimed` \| `boost_id` given but the player has not claimed it. \| yes \| Check eligibility, claim the boost with promotions `POST /v1/boosts/claim`, then retry the bet. \| \| 400 \| `missing_fields` \| A required field is missing \| yes \| Fix the input: add the fields listed in `fields`, then retry. \| \| 401 \| `unauthorized` \| Missing key, or another API's key \| yes \| Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. \| \| 401 \| `unresolved_reference` \| A Passport reference skipped the proxy \| yes \| Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. \|

- HTTP Method: `POST`
- Endpoint: `/v1/bets`

**Parameters**

| Name | Type                                                    | Required | Description       |
| :--- | :------------------------------------------------------ | :------- | :---------------- |
| body | [BetsPostBetsRequest](../models/BetsPostBetsRequest.md) | ✅       | The request body. |

**Return Type**

`BetsPostBetsCreatedResponse`

**Example Usage Code Snippet**

```typescript
import { BetsPostBetsRequest, RidgelineBets, Selections } from 'ridgeline-bets';

(async () => {
  const ridgelineBets = new RidgelineBets({
    token: 'YOUR_TOKEN',
  });

  const betsPostBetsRequestProduct = 'sportsbook';

  const selections: Selections = {
    marketId: 'market_id',
    outcomeId: 'outcome_id',
  };

  const betsPostBetsRequest: BetsPostBetsRequest = {
    playerId: 'player_id',
    product: betsPostBetsRequestProduct,
    selections: [selections],
    stakeMinor: 9,
    boostId: 'boost_id',
  };

  const data = await ridgelineBets.bets.betsPostBets(betsPostBetsRequest);

  console.log(data);
})();
```
