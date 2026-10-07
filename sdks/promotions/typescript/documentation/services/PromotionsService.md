# PromotionsService

A list of all methods in the `PromotionsService` service. Click on the method name to view detailed information about that method.

| Methods                                                 | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| :------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [promotionsGetBoosts](#promotionsgetboosts)             | List boosts. **Errors** (with what a client or agent should do) \| Status \| `error` \| When \| Recoverable \| What to do \| \|---\|---\|---\|---\|---\| \| 400 \| `missing_fields` \| A required field is missing \| yes \| Fix the input: add the fields listed in `fields`, then retry. \| \| 401 \| `unauthorized` \| Missing key, or another API's key \| yes \| Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. \| \| 401 \| `unresolved_reference` \| A Passport reference skipped the proxy \| yes \| Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. \|                                                                                                                                                                                                                                                                                                            |
| [promotionsPostBoosts](#promotionspostboosts)           | Create a boost on a market. `profit_boost_pct` raises the profit of a winning bet; `rewards_back_pct` credits a share of the stake as rewards when the boosted bet is placed. **Errors** (with what a client or agent should do) \| Status \| `error` \| When \| Recoverable \| What to do \| \|---\|---\|---\|---\|---\| \| 404 \| `market_not_found` \| Unknown `market_id`. \| yes \| Look up a valid `market_id` with markets `GET /v1/markets`, then retry. \| \| 400 \| `missing_fields` \| A required field is missing \| yes \| Fix the input: add the fields listed in `fields`, then retry. \| \| 401 \| `unauthorized` \| Missing key, or another API's key \| yes \| Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. \| \| 401 \| `unresolved_reference` \| A Passport reference skipped the proxy \| yes \| Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. \| |
| [promotionsPostBoostsClaim](#promotionspostboostsclaim) | Claim a boost for a player. **The caller must check eligibility and location first.** This endpoint does not. Claiming twice returns the existing claim. **Errors** (with what a client or agent should do) \| Status \| `error` \| When \| Recoverable \| What to do \| \|---\|---\|---\|---\|---\| \| 404 \| `boost_not_found` \| Unknown `boost_id`. \| yes \| Look up the boost with promotions `GET /v1/boosts`, or create it first. \| \| 400 \| `missing_fields` \| A required field is missing \| yes \| Fix the input: add the fields listed in `fields`, then retry. \| \| 401 \| `unauthorized` \| Missing key, or another API's key \| yes \| Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. \| \| 401 \| `unresolved_reference` \| A Passport reference skipped the proxy \| yes \| Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. \|                        |
| [promotionsGetBoostsClaims](#promotionsgetboostsclaims) | List claims, optionally for one `boost_id`. Use it to verify the end state after a campaign: no protected player should hold a claim. **Errors** (with what a client or agent should do) \| Status \| `error` \| When \| Recoverable \| What to do \| \|---\|---\|---\|---\|---\| \| 400 \| `missing_fields` \| A required field is missing \| yes \| Fix the input: add the fields listed in `fields`, then retry. \| \| 401 \| `unauthorized` \| Missing key, or another API's key \| yes \| Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. \| \| 401 \| `unresolved_reference` \| A Passport reference skipped the proxy \| yes \| Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. \|                                                                                                                                                                                   |

## promotionsGetBoosts

List boosts. **Errors** (with what a client or agent should do) \| Status \| `error` \| When \| Recoverable \| What to do \| \|---\|---\|---\|---\|---\| \| 400 \| `missing_fields` \| A required field is missing \| yes \| Fix the input: add the fields listed in `fields`, then retry. \| \| 401 \| `unauthorized` \| Missing key, or another API's key \| yes \| Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. \| \| 401 \| `unresolved_reference` \| A Passport reference skipped the proxy \| yes \| Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. \|

- HTTP Method: `GET`
- Endpoint: `/v1/boosts`

**Return Type**

`any`

**Example Usage Code Snippet**

```typescript
import { RidgelinePromotions } from 'ridgeline-promotions';

(async () => {
  const ridgelinePromotions = new RidgelinePromotions({
    token: 'YOUR_TOKEN',
  });

  const data = await ridgelinePromotions.promotions.promotionsGetBoosts();

  console.log(data);
})();
```

## promotionsPostBoosts

Create a boost on a market. `profit_boost_pct` raises the profit of a winning bet; `rewards_back_pct` credits a share of the stake as rewards when the boosted bet is placed. **Errors** (with what a client or agent should do) \| Status \| `error` \| When \| Recoverable \| What to do \| \|---\|---\|---\|---\|---\| \| 404 \| `market_not_found` \| Unknown `market_id`. \| yes \| Look up a valid `market_id` with markets `GET /v1/markets`, then retry. \| \| 400 \| `missing_fields` \| A required field is missing \| yes \| Fix the input: add the fields listed in `fields`, then retry. \| \| 401 \| `unauthorized` \| Missing key, or another API's key \| yes \| Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. \| \| 401 \| `unresolved_reference` \| A Passport reference skipped the proxy \| yes \| Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. \|

- HTTP Method: `POST`
- Endpoint: `/v1/boosts`

**Parameters**

| Name | Type                                                                    | Required | Description       |
| :--- | :---------------------------------------------------------------------- | :------- | :---------------- |
| body | [PromotionsPostBoostsRequest](../models/PromotionsPostBoostsRequest.md) | ✅       | The request body. |

**Return Type**

`any`

**Example Usage Code Snippet**

```typescript
import { PromotionsPostBoostsRequest, RidgelinePromotions } from 'ridgeline-promotions';

(async () => {
  const ridgelinePromotions = new RidgelinePromotions({
    token: 'YOUR_TOKEN',
  });

  const products = 'sportsbook';

  const promotionsPostBoostsRequest: PromotionsPostBoostsRequest = {
    name: 'name',
    marketId: 'market_id',
    profitBoostPct: 8,
    rewardsBackPct: 2,
    products: [products],
  };

  const data = await ridgelinePromotions.promotions.promotionsPostBoosts(
    promotionsPostBoostsRequest,
  );

  console.log(data);
})();
```

## promotionsPostBoostsClaim

Claim a boost for a player. **The caller must check eligibility and location first.** This endpoint does not. Claiming twice returns the existing claim. **Errors** (with what a client or agent should do) \| Status \| `error` \| When \| Recoverable \| What to do \| \|---\|---\|---\|---\|---\| \| 404 \| `boost_not_found` \| Unknown `boost_id`. \| yes \| Look up the boost with promotions `GET /v1/boosts`, or create it first. \| \| 400 \| `missing_fields` \| A required field is missing \| yes \| Fix the input: add the fields listed in `fields`, then retry. \| \| 401 \| `unauthorized` \| Missing key, or another API's key \| yes \| Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. \| \| 401 \| `unresolved_reference` \| A Passport reference skipped the proxy \| yes \| Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. \|

- HTTP Method: `POST`
- Endpoint: `/v1/boosts/claim`

**Parameters**

| Name | Type                                                                              | Required | Description       |
| :--- | :-------------------------------------------------------------------------------- | :------- | :---------------- |
| body | [PromotionsPostBoostsClaimRequest](../models/PromotionsPostBoostsClaimRequest.md) | ✅       | The request body. |

**Return Type**

`any`

**Example Usage Code Snippet**

```typescript
import { PromotionsPostBoostsClaimRequest, RidgelinePromotions } from 'ridgeline-promotions';

(async () => {
  const ridgelinePromotions = new RidgelinePromotions({
    token: 'YOUR_TOKEN',
  });

  const promotionsPostBoostsClaimRequest: PromotionsPostBoostsClaimRequest = {
    boostId: 'boost_id',
    playerId: 'player_id',
  };

  const data = await ridgelinePromotions.promotions.promotionsPostBoostsClaim(
    promotionsPostBoostsClaimRequest,
  );

  console.log(data);
})();
```

## promotionsGetBoostsClaims

List claims, optionally for one `boost_id`. Use it to verify the end state after a campaign: no protected player should hold a claim. **Errors** (with what a client or agent should do) \| Status \| `error` \| When \| Recoverable \| What to do \| \|---\|---\|---\|---\|---\| \| 400 \| `missing_fields` \| A required field is missing \| yes \| Fix the input: add the fields listed in `fields`, then retry. \| \| 401 \| `unauthorized` \| Missing key, or another API's key \| yes \| Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. \| \| 401 \| `unresolved_reference` \| A Passport reference skipped the proxy \| yes \| Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. \|

- HTTP Method: `GET`
- Endpoint: `/v1/boosts/claims`

**Parameters**

| Name    | Type   | Required | Description      |
| :------ | :----- | :------- | :--------------- |
| boostId | string | ❌       | Filter by boost. |

**Return Type**

`any`

**Example Usage Code Snippet**

```typescript
import { RidgelinePromotions } from 'ridgeline-promotions';

(async () => {
  const ridgelinePromotions = new RidgelinePromotions({
    token: 'YOUR_TOKEN',
  });

  const data = await ridgelinePromotions.promotions.promotionsGetBoostsClaims({
    boostId: 'boost_id',
  });

  console.log(data);
})();
```
