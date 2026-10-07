# PromotionsPostBoostsRequest

**Properties**

| Name           | Type                      | Required | Description                                                                            |
| :------------- | :------------------------ | :------- | :------------------------------------------------------------------------------------- |
| name           | string                    | ✅       | Display name.                                                                          |
| marketId       | string                    | ✅       | Market ID from the markets API, e.g. `MKT-ML-001`.                                     |
| profitBoostPct | number                    | ✅       | Extra profit on a winning boosted bet, as a whole-number percent (25 = +25% profit).   |
| rewardsBackPct | number                    | ✅       | Share of the stake credited as rewards, as a whole-number percent (10 = 10% of stake). |
| products       | [Products](Products.md)[] | ✅       | Products the boost applies to.                                                         |
