# PlayerLimitsService

A list of all methods in the `PlayerLimitsService` service. Click on the method name to view detailed information about that method.

| Methods                                                               | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| :-------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [playerLimitsPostEligibilityCheck](#playerlimitsposteligibilitycheck) | Check a player before any wager, offer, boost or claim. Pass `amount_minor` to include the daily-limit check. A player can be ineligible for a wager (`DAILY_WAGER_LIMIT`) yet still allowed promotions. **Errors** (with what a client or agent should do) \| Status \| `error` \| When \| Recoverable \| What to do \| \|---\|---\|---\|---\|---\| \| 400 \| `invalid_product` \| `product` is not `sportsbook` or `casino`. \| yes \| Fix the input: use `sportsbook` or `casino`. \| \| 404 \| `player_not_found` \| Unknown `player_id`. \| no \| Stop: the player ID is wrong. Do not guess another ID. \| \| 400 \| `missing_fields` \| A required field is missing \| yes \| Fix the input: add the fields listed in `fields`, then retry. \| \| 401 \| `unauthorized` \| Missing key, or another API's key \| yes \| Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. \| \| 401 \| `unresolved_reference` \| A Passport reference skipped the proxy \| yes \| Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. \| |
| [playerLimitsPostLimits](#playerlimitspostlimits)                     | Get a player's protection status and daily limit usage. **Errors** (with what a client or agent should do) \| Status \| `error` \| When \| Recoverable \| What to do \| \|---\|---\|---\|---\|---\| \| 404 \| `player_not_found` \| Unknown `player_id`. \| no \| Stop: the player ID is wrong. Do not guess another ID. \| \| 400 \| `missing_fields` \| A required field is missing \| yes \| Fix the input: add the fields listed in `fields`, then retry. \| \| 401 \| `unauthorized` \| Missing key, or another API's key \| yes \| Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. \| \| 401 \| `unresolved_reference` \| A Passport reference skipped the proxy \| yes \| Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. \|                                                                                                                                                                                                                                                                                      |

## playerLimitsPostEligibilityCheck

Check a player before any wager, offer, boost or claim. Pass `amount_minor` to include the daily-limit check. A player can be ineligible for a wager (`DAILY_WAGER_LIMIT`) yet still allowed promotions. **Errors** (with what a client or agent should do) \| Status \| `error` \| When \| Recoverable \| What to do \| \|---\|---\|---\|---\|---\| \| 400 \| `invalid_product` \| `product` is not `sportsbook` or `casino`. \| yes \| Fix the input: use `sportsbook` or `casino`. \| \| 404 \| `player_not_found` \| Unknown `player_id`. \| no \| Stop: the player ID is wrong. Do not guess another ID. \| \| 400 \| `missing_fields` \| A required field is missing \| yes \| Fix the input: add the fields listed in `fields`, then retry. \| \| 401 \| `unauthorized` \| Missing key, or another API's key \| yes \| Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. \| \| 401 \| `unresolved_reference` \| A Passport reference skipped the proxy \| yes \| Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. \|

- HTTP Method: `POST`
- Endpoint: `/v1/eligibility/check`

**Parameters**

| Name | Type                                                                                            | Required | Description       |
| :--- | :---------------------------------------------------------------------------------------------- | :------- | :---------------- |
| body | [PlayerLimitsPostEligibilityCheckRequest](../models/PlayerLimitsPostEligibilityCheckRequest.md) | ✅       | The request body. |

**Return Type**

`PlayerLimitsPostEligibilityCheckOkResponse`

**Example Usage Code Snippet**

```typescript
import {
  PlayerLimitsPostEligibilityCheckRequest,
  RidgelinePlayerLimits,
} from 'ridgeline-player-limits';

(async () => {
  const ridgelinePlayerLimits = new RidgelinePlayerLimits({
    token: 'YOUR_TOKEN',
  });

  const playerLimitsPostEligibilityCheckRequestProduct = 'sportsbook';

  const playerLimitsPostEligibilityCheckRequest: PlayerLimitsPostEligibilityCheckRequest = {
    playerId: 'player_id',
    product: playerLimitsPostEligibilityCheckRequestProduct,
    amountMinor: 9,
  };

  const data = await ridgelinePlayerLimits.playerLimits.playerLimitsPostEligibilityCheck(
    playerLimitsPostEligibilityCheckRequest,
  );

  console.log(data);
})();
```

## playerLimitsPostLimits

Get a player's protection status and daily limit usage. **Errors** (with what a client or agent should do) \| Status \| `error` \| When \| Recoverable \| What to do \| \|---\|---\|---\|---\|---\| \| 404 \| `player_not_found` \| Unknown `player_id`. \| no \| Stop: the player ID is wrong. Do not guess another ID. \| \| 400 \| `missing_fields` \| A required field is missing \| yes \| Fix the input: add the fields listed in `fields`, then retry. \| \| 401 \| `unauthorized` \| Missing key, or another API's key \| yes \| Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. \| \| 401 \| `unresolved_reference` \| A Passport reference skipped the proxy \| yes \| Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. \|

- HTTP Method: `POST`
- Endpoint: `/v1/limits`

**Parameters**

| Name | Type                                                                        | Required | Description       |
| :--- | :-------------------------------------------------------------------------- | :------- | :---------------- |
| body | [PlayerLimitsPostLimitsRequest](../models/PlayerLimitsPostLimitsRequest.md) | ✅       | The request body. |

**Return Type**

`any`

**Example Usage Code Snippet**

```typescript
import { PlayerLimitsPostLimitsRequest, RidgelinePlayerLimits } from 'ridgeline-player-limits';

(async () => {
  const ridgelinePlayerLimits = new RidgelinePlayerLimits({
    token: 'YOUR_TOKEN',
  });

  const playerLimitsPostLimitsRequest: PlayerLimitsPostLimitsRequest = {
    playerId: 'player_id',
  };

  const data = await ridgelinePlayerLimits.playerLimits.playerLimitsPostLimits(
    playerLimitsPostLimitsRequest,
  );

  console.log(data);
})();
```
