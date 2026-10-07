# MarketsService

A list of all methods in the `MarketsService` service. Click on the method name to view detailed information about that method.

| Methods                                 | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| :-------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [marketsGetEvents](#marketsgetevents)   | List upcoming events. **Errors** (with what a client or agent should do) \| Status \| `error` \| When \| Recoverable \| What to do \| \|---\|---\|---\|---\|---\| \| 400 \| `missing_fields` \| A required field is missing \| yes \| Fix the input: add the fields listed in `fields`, then retry. \| \| 401 \| `unauthorized` \| Missing key, or another API's key \| yes \| Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. \| \| 401 \| `unresolved_reference` \| A Passport reference skipped the proxy \| yes \| Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. \|                                                                                                                                                                                                                            |
| [marketsGetMarkets](#marketsgetmarkets) | List markets with their outcomes and odds. Filter with `event_id`. American and decimal odds are both returned. Use `decimal_odds` for payout math (`payout = stake × decimal_odds`). An unknown `event_id` returns an empty list, not an error. **Errors** (with what a client or agent should do) \| Status \| `error` \| When \| Recoverable \| What to do \| \|---\|---\|---\|---\|---\| \| 400 \| `missing_fields` \| A required field is missing \| yes \| Fix the input: add the fields listed in `fields`, then retry. \| \| 401 \| `unauthorized` \| Missing key, or another API's key \| yes \| Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. \| \| 401 \| `unresolved_reference` \| A Passport reference skipped the proxy \| yes \| Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. \| |

## marketsGetEvents

List upcoming events. **Errors** (with what a client or agent should do) \| Status \| `error` \| When \| Recoverable \| What to do \| \|---\|---\|---\|---\|---\| \| 400 \| `missing_fields` \| A required field is missing \| yes \| Fix the input: add the fields listed in `fields`, then retry. \| \| 401 \| `unauthorized` \| Missing key, or another API's key \| yes \| Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. \| \| 401 \| `unresolved_reference` \| A Passport reference skipped the proxy \| yes \| Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. \|

- HTTP Method: `GET`
- Endpoint: `/v1/events`

**Return Type**

`MarketsGetEventsOkResponse`

**Example Usage Code Snippet**

```typescript
import { RidgelineMarkets } from 'ridgeline-markets';

(async () => {
  const ridgelineMarkets = new RidgelineMarkets({
    token: 'YOUR_TOKEN',
  });

  const data = await ridgelineMarkets.markets.marketsGetEvents();

  console.log(data);
})();
```

## marketsGetMarkets

List markets with their outcomes and odds. Filter with `event_id`. American and decimal odds are both returned. Use `decimal_odds` for payout math (`payout = stake × decimal_odds`). An unknown `event_id` returns an empty list, not an error. **Errors** (with what a client or agent should do) \| Status \| `error` \| When \| Recoverable \| What to do \| \|---\|---\|---\|---\|---\| \| 400 \| `missing_fields` \| A required field is missing \| yes \| Fix the input: add the fields listed in `fields`, then retry. \| \| 401 \| `unauthorized` \| Missing key, or another API's key \| yes \| Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. \| \| 401 \| `unresolved_reference` \| A Passport reference skipped the proxy \| yes \| Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. \|

- HTTP Method: `GET`
- Endpoint: `/v1/markets`

**Parameters**

| Name    | Type   | Required | Description      |
| :------ | :----- | :------- | :--------------- |
| eventId | string | ❌       | Filter by event. |

**Return Type**

`MarketsGetMarketsOkResponse`

**Example Usage Code Snippet**

```typescript
import { RidgelineMarkets } from 'ridgeline-markets';

(async () => {
  const ridgelineMarkets = new RidgelineMarkets({
    token: 'YOUR_TOKEN',
  });

  const data = await ridgelineMarkets.markets.marketsGetMarkets({
    eventId: 'event_id',
  });

  console.log(data);
})();
```
