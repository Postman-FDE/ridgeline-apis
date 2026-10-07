# PlayerLimitsPostEligibilityCheckOkResponse

**Properties**

| Name                     | Type                                              | Required | Description                                                                                                               |
| :----------------------- | :------------------------------------------------ | :------- | :------------------------------------------------------------------------------------------------------------------------ |
| playerId                 | string                                            | ✅       | Sandbox player ID, `P-1001` to `P-1005`.                                                                                  |
| eligible                 | boolean                                           | ✅       | `true` if the player may place this wager now.                                                                            |
| reasons                  | [Reasons](Reasons.md)[]                           | ✅       | Why the player is blocked: `SELF_EXCLUDED`, `COOL_OFF`, `DAILY_WAGER_LIMIT`. Empty when eligible.                         |
| mayReceivePromotions     | boolean                                           | ✅       | `false` for self-excluded and cool-off players. Callers must not show, offer or claim any promotion when this is `false`. |
| product                  | PlayerLimitsPostEligibilityCheckOkResponseProduct | ❌       | `sportsbook` or `casino`.                                                                                                 |
| remainingDailyWagerMinor | number                                            | ❌       | How much more the player may wager today, in cents.                                                                       |
| checkedAt                | string                                            | ❌       | When the check ran (ISO 8601).                                                                                            |

# PlayerLimitsPostEligibilityCheckOkResponseProduct

`sportsbook` or `casino`.

**Properties**

| Name       | Type   | Required | Description  |
| :--------- | :----- | :------- | :----------- |
| SPORTSBOOK | string | ✅       | "sportsbook" |
| CASINO     | string | ✅       | "casino"     |
