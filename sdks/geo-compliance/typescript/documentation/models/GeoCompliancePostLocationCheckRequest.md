# GeoCompliancePostLocationCheckRequest

**Properties**

| Name     | Type    | Required | Description                              |
| :------- | :------ | :------- | :--------------------------------------- |
| playerId | string  | ✅       | Sandbox player ID, `P-1001` to `P-1005`. |
| product  | Product | ✅       | `sportsbook` or `casino`.                |

# Product

`sportsbook` or `casino`.

**Properties**

| Name       | Type   | Required | Description  |
| :--------- | :----- | :------- | :----------- |
| SPORTSBOOK | string | ✅       | "sportsbook" |
| CASINO     | string | ✅       | "casino"     |
