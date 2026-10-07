# WalletService

A list of all methods in the `WalletService` service. Click on the method name to view detailed information about that method.

| Methods                                                         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| :-------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [walletPostWalletBalance](#walletpostwalletbalance)             | Get a player's current balances. **Errors** (with what a client or agent should do) \| Status \| `error` \| When \| Recoverable \| What to do \| \|---\|---\|---\|---\|---\| \| 404 \| `player_not_found` \| Unknown `player_id`. \| no \| Stop: the player ID is wrong. Do not guess another ID. \| \| 400 \| `missing_fields` \| A required field is missing \| yes \| Fix the input: add the fields listed in `fields`, then retry. \| \| 401 \| `unauthorized` \| Missing key, or another API's key \| yes \| Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. \| \| 401 \| `unresolved_reference` \| A Passport reference skipped the proxy \| yes \| Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. \|                                                                                                                                                                                                                                                                                                                                                                                            |
| [walletPostWalletRewardsCredit](#walletpostwalletrewardscredit) | Credit rewards to a player. Idempotent on `idempotency_key`: the first call credits, replays return the current balance unchanged. **Check `player-limits` first.** Protected players (`may_receive_promotions: false`) must not receive promotional credits. **Errors** (with what a client or agent should do) \| Status \| `error` \| When \| Recoverable \| What to do \| \|---\|---\|---\|---\|---\| \| 400 \| `invalid_amount` \| `amount_minor` is not a positive integer. \| yes \| Fix the input: send a positive integer in cents (e.g. 1000), then retry. \| \| 404 \| `player_not_found` \| Unknown `player_id`. \| no \| Stop: the player ID is wrong. Do not guess another ID. \| \| 400 \| `missing_fields` \| A required field is missing \| yes \| Fix the input: add the fields listed in `fields`, then retry. \| \| 401 \| `unauthorized` \| Missing key, or another API's key \| yes \| Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. \| \| 401 \| `unresolved_reference` \| A Passport reference skipped the proxy \| yes \| Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. \| |

## walletPostWalletBalance

Get a player's current balances. **Errors** (with what a client or agent should do) \| Status \| `error` \| When \| Recoverable \| What to do \| \|---\|---\|---\|---\|---\| \| 404 \| `player_not_found` \| Unknown `player_id`. \| no \| Stop: the player ID is wrong. Do not guess another ID. \| \| 400 \| `missing_fields` \| A required field is missing \| yes \| Fix the input: add the fields listed in `fields`, then retry. \| \| 401 \| `unauthorized` \| Missing key, or another API's key \| yes \| Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. \| \| 401 \| `unresolved_reference` \| A Passport reference skipped the proxy \| yes \| Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. \|

- HTTP Method: `POST`
- Endpoint: `/v1/wallet/balance`

**Parameters**

| Name | Type                                                                          | Required | Description       |
| :--- | :---------------------------------------------------------------------------- | :------- | :---------------- |
| body | [WalletPostWalletBalanceRequest](../models/WalletPostWalletBalanceRequest.md) | ✅       | The request body. |

**Return Type**

`any`

**Example Usage Code Snippet**

```typescript
import { RidgelineWallet, WalletPostWalletBalanceRequest } from 'ridgeline-wallet';

(async () => {
  const ridgelineWallet = new RidgelineWallet({
    token: 'YOUR_TOKEN',
  });

  const walletPostWalletBalanceRequest: WalletPostWalletBalanceRequest = {
    playerId: 'player_id',
  };

  const data = await ridgelineWallet.wallet.walletPostWalletBalance(walletPostWalletBalanceRequest);

  console.log(data);
})();
```

## walletPostWalletRewardsCredit

Credit rewards to a player. Idempotent on `idempotency_key`: the first call credits, replays return the current balance unchanged. **Check `player-limits` first.** Protected players (`may_receive_promotions: false`) must not receive promotional credits. **Errors** (with what a client or agent should do) \| Status \| `error` \| When \| Recoverable \| What to do \| \|---\|---\|---\|---\|---\| \| 400 \| `invalid_amount` \| `amount_minor` is not a positive integer. \| yes \| Fix the input: send a positive integer in cents (e.g. 1000), then retry. \| \| 404 \| `player_not_found` \| Unknown `player_id`. \| no \| Stop: the player ID is wrong. Do not guess another ID. \| \| 400 \| `missing_fields` \| A required field is missing \| yes \| Fix the input: add the fields listed in `fields`, then retry. \| \| 401 \| `unauthorized` \| Missing key, or another API's key \| yes \| Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. \| \| 401 \| `unresolved_reference` \| A Passport reference skipped the proxy \| yes \| Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. \|

- HTTP Method: `POST`
- Endpoint: `/v1/wallet/rewards/credit`

**Parameters**

| Name | Type                                                                                      | Required | Description       |
| :--- | :---------------------------------------------------------------------------------------- | :------- | :---------------- |
| body | [WalletPostWalletRewardsCreditRequest](../models/WalletPostWalletRewardsCreditRequest.md) | ✅       | The request body. |

**Return Type**

`any`

**Example Usage Code Snippet**

```typescript
import { RidgelineWallet, WalletPostWalletRewardsCreditRequest } from 'ridgeline-wallet';

(async () => {
  const ridgelineWallet = new RidgelineWallet({
    token: 'YOUR_TOKEN',
  });

  const walletPostWalletRewardsCreditRequest: WalletPostWalletRewardsCreditRequest = {
    playerId: 'player_id',
    amountMinor: 10,
    reason: 'reason',
    idempotencyKey: 'idempotency_key',
  };

  const data = await ridgelineWallet.wallet.walletPostWalletRewardsCredit(
    walletPostWalletRewardsCreditRequest,
  );

  console.log(data);
})();
```
