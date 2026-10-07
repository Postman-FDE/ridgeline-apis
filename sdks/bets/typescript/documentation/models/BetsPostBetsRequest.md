# BetsPostBetsRequest

**Properties**

| Name       | Type                          | Required | Description                                                                                        |
| :--------- | :---------------------------- | :------- | :------------------------------------------------------------------------------------------------- |
| playerId   | string                        | ✅       | Boost to apply. The player must have claimed it first.                                             |
| selections | [Selections](Selections.md)[] | ✅       | One or more `{ market_id, outcome_id }`. More than one makes a parlay (odds multiply).             |
| stakeMinor | number                        | ✅       | Stake in minor units (cents). Integer, at least 1. `1000` = $10.00. Replaces the v1 `stake` field. |
| product    | BetsPostBetsRequestProduct    | ❌       | `sportsbook` or `casino`.                                                                          |
| boostId    | string                        | ❌       | Boost to apply. The player must have claimed it first.                                             |

# BetsPostBetsRequestProduct

`sportsbook` or `casino`.

**Properties**

| Name       | Type   | Required | Description  |
| :--------- | :----- | :------- | :----------- |
| SPORTSBOOK | string | ✅       | "sportsbook" |
| CASINO     | string | ✅       | "casino"     |
