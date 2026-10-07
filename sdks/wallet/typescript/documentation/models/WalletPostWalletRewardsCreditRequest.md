# WalletPostWalletRewardsCreditRequest

**Properties**

| Name           | Type   | Required | Description                                                                                     |
| :------------- | :----- | :------- | :---------------------------------------------------------------------------------------------- |
| playerId       | string | ✅       | Sandbox player ID, `P-1001` to `P-1005`.                                                        |
| amountMinor    | number | ✅       | Amount in minor units (cents). Integer, at least 1.                                             |
| reason         | string | ✅       | Why the credit was issued (shown in the ledger).                                                |
| idempotencyKey | string | ✅       | Unique key per credit. Replaying the same key returns the same result and never double-credits. |
