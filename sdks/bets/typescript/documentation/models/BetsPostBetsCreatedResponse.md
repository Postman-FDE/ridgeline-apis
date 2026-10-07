# BetsPostBetsCreatedResponse

**Properties**

| Name                 | Type                               | Required | Description                                                                                        |
| :------------------- | :--------------------------------- | :------- | :------------------------------------------------------------------------------------------------- |
| betId                | string                             | ✅       | Sandbox player ID, `P-1001` to `P-1005`.                                                           |
| status               | Status                             | ✅       | Lifecycle status.                                                                                  |
| stakeMinor           | number                             | ✅       | Stake in minor units (cents). Integer, at least 1. `1000` = $10.00. Replaces the v1 `stake` field. |
| potentialPayoutMinor | number                             | ✅       | Total return if the bet wins (stake + profit, including any boost), in cents.                      |
| rewardsEarnedMinor   | number                             | ✅       | Rewards credited by this bet (from the boost), in cents.                                           |
| playerId             | string                             | ❌       | Sandbox player ID, `P-1001` to `P-1005`.                                                           |
| product              | BetsPostBetsCreatedResponseProduct | ❌       | `sportsbook` or `casino`.                                                                          |
| boostId              | string                             | ❌       | Boost to apply. The player must have claimed it first.                                             |
| placedAt             | string                             | ❌       | When the bet was accepted (ISO 8601).                                                              |

# Status

Lifecycle status.

**Properties**

| Name     | Type   | Required | Description |
| :------- | :----- | :------- | :---------- |
| ACCEPTED | string | ✅       | "accepted"  |

# BetsPostBetsCreatedResponseProduct

`sportsbook` or `casino`.

**Properties**

| Name       | Type   | Required | Description  |
| :--------- | :----- | :------- | :----------- |
| SPORTSBOOK | string | ✅       | "sportsbook" |
| CASINO     | string | ✅       | "casino"     |
