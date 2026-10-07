# PlayerLimitsPostEligibilityCheckRequest

**Properties**

| Name        | Type                                           | Required | Description                                         |
| :---------- | :--------------------------------------------- | :------- | :-------------------------------------------------- |
| playerId    | string                                         | ✅       | Sandbox player ID, `P-1001` to `P-1005`.            |
| product     | PlayerLimitsPostEligibilityCheckRequestProduct | ✅       | `sportsbook` or `casino`.                           |
| amountMinor | number                                         | ❌       | Amount in minor units (cents). Integer, at least 1. |

# PlayerLimitsPostEligibilityCheckRequestProduct

`sportsbook` or `casino`.

**Properties**

| Name       | Type   | Required | Description  |
| :--------- | :----- | :------- | :----------- |
| SPORTSBOOK | string | ✅       | "sportsbook" |
| CASINO     | string | ✅       | "casino"     |
