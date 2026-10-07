# GeoComplianceService

A list of all methods in the `GeoComplianceService` service. Click on the method name to view detailed information about that method.

| Methods                                                           | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| :---------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [geoCompliancePostLocationCheck](#geocompliancepostlocationcheck) | Check whether `product` is available where the player is located. `reason` is `PRODUCT_NOT_AVAILABLE_IN_STATE` when it is not. **Errors** (with what a client or agent should do) \| Status \| `error` \| When \| Recoverable \| What to do \| \|---\|---\|---\|---\|---\| \| 404 \| `player_not_found` \| Unknown `player_id`. \| no \| Stop: the player ID is wrong. Do not guess another ID. \| \| 400 \| `missing_fields` \| A required field is missing \| yes \| Fix the input: add the fields listed in `fields`, then retry. \| \| 401 \| `unauthorized` \| Missing key, or another API's key \| yes \| Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. \| \| 401 \| `unresolved_reference` \| A Passport reference skipped the proxy \| yes \| Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. \| |

## geoCompliancePostLocationCheck

Check whether `product` is available where the player is located. `reason` is `PRODUCT_NOT_AVAILABLE_IN_STATE` when it is not. **Errors** (with what a client or agent should do) \| Status \| `error` \| When \| Recoverable \| What to do \| \|---\|---\|---\|---\|---\| \| 404 \| `player_not_found` \| Unknown `player_id`. \| no \| Stop: the player ID is wrong. Do not guess another ID. \| \| 400 \| `missing_fields` \| A required field is missing \| yes \| Fix the input: add the fields listed in `fields`, then retry. \| \| 401 \| `unauthorized` \| Missing key, or another API's key \| yes \| Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. \| \| 401 \| `unresolved_reference` \| A Passport reference skipped the proxy \| yes \| Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. \|

- HTTP Method: `POST`
- Endpoint: `/v1/location/check`

**Parameters**

| Name | Type                                                                                        | Required | Description       |
| :--- | :------------------------------------------------------------------------------------------ | :------- | :---------------- |
| body | [GeoCompliancePostLocationCheckRequest](../models/GeoCompliancePostLocationCheckRequest.md) | ✅       | The request body. |

**Return Type**

`any`

**Example Usage Code Snippet**

```typescript
import {
  GeoCompliancePostLocationCheckRequest,
  RidgelineGeoCompliance,
} from 'ridgeline-geo-compliance';

(async () => {
  const ridgelineGeoCompliance = new RidgelineGeoCompliance({
    token: 'YOUR_TOKEN',
  });

  const product = 'sportsbook';

  const geoCompliancePostLocationCheckRequest: GeoCompliancePostLocationCheckRequest = {
    playerId: 'player_id',
    product: product,
  };

  const data = await ridgelineGeoCompliance.geoCompliance.geoCompliancePostLocationCheck(
    geoCompliancePostLocationCheckRequest,
  );

  console.log(data);
})();
```
