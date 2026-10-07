# RidgelineMarkets TypeScript SDK 1.0.0

Welcome to the RidgelineMarkets SDK documentation. This guide will help you get started with integrating and using the RidgelineMarkets SDK in your project.

## Versions

- SDK version: `1.0.0`

## About the API

Events and odds for the sportsbook. Read-only.

Read-only catalog of **events** and **markets with odds**. Use it to build a bet slip and to find the `market_id` / `outcome_id` that bets and promotions need.

**Owner:** Team Trading · **Consumers:** bet-slip, sportsbook-app, promotions tooling

The sandbox has one event, `EVT-FINAL-2026` (Championship Final: Harbor Hawks vs. Summit Bears), with a moneyline (`MKT-ML-001`) and a total (`MKT-TOT-001`).

## Authentication

Send `Authorization: Bearer <key>`. **Each API has its own key**, and a key for one API is rejected by the others.

Keys are never handed out directly. Request access and you receive a **credential reference** such as `{{vault:RIDGELINE_BETS_KEY}}`. A secure access proxy (Postman Passport) swaps the reference for the real key at call time, so neither your code, your agent nor its logs ever hold the secret.

| Response                   | Meaning                                                                            |
| -------------------------- | ---------------------------------------------------------------------------------- |
| `401 unauthorized`         | Missing key, or a key for a different API                                          |
| `401 unresolved_reference` | A `{{vault:...}}` reference reached the API unresolved: the call skipped the proxy |

## Getting access (credential acquisition)

1. **Find the API** in the Postman API Catalog (or the Ridgeline Sandbox workspace): **Markets API**, owned by **Team Trading**.
2. **Request access** in Postman Passport: namespace **Ridgeline Sandbox**, resource group **Markets API**. Pick the shortest duration that covers the job and give a reason.
3. **Wait for approval** from Team Trading. The grant is scoped to this API's endpoints (method + host + path) and expires on its own.
4. **Use the reference**, not a key: `passport whoami` shows it, e.g. `{{vault:RIDGELINE_MARKETS_KEY}}`. Send it as `Authorization: Bearer {{vault:RIDGELINE_MARKETS_KEY}}` through the Passport proxy.

There are no scopes beyond the endpoint grant. One grant per API: a key for one API never works on another.

## Conventions

- **Base URL:** `https://<host>/<api>`, e.g. `https://<host>/bets/v1/bets`. Paths are exact (no path parameters), so access grants can match method + host + path.
- **Money:** every amount is an **integer in minor units (cents)**. `1000` = $10.00. Decimals are rejected.
- **Products:** `sportsbook` or `casino`.
- **Players:** sandbox players `P-1001` to `P-1005` (see each API's notes).
- **Errors:** JSON `{ "error": "<code>", "message": "<human readable>" }`, plus extra fields where noted.
- **Idempotency:** write endpoints that move value take an `idempotency_key` or are naturally idempotent (claims).

_Ridgeline is a fictional company; all data is sandbox data._

## Table of Contents

- [Setup & Configuration](#setup--configuration)
  - [Supported Language Versions](#supported-language-versions)
  - [Installation](#installation)
  - [Runtime Compatibility](#runtime-compatibility)
- [Authentication](#authentication)
  - [Access Token Authentication](#access-token-authentication)
- [Setting a Custom Timeout](#setting-a-custom-timeout)
- [Sample Usage](#sample-usage)
- [Services](#services)
- [Models](#models)

# Setup & Configuration

## Supported Language Versions

This SDK is compatible with the following versions: `TypeScript >= 4.8.4`

## Installation

To get started with the SDK, we recommend installing using `npm` or `yarn`:

```bash
npm install ridgeline-markets
```

or

```bash
yarn add ridgeline-markets
```

## Runtime Compatibility

The SDK works in the following runtimes:

- Node.js 18+
- Vercel
- Cloudflare Workers
- Deno v1.25+
- Bun 1.0+
- React Native

## Authentication

### Access Token Authentication

The RidgelineMarkets API uses an Access Token for authentication.

This token must be provided to authenticate your requests to the API.

#### Setting the Access Token

When you initialize the SDK, you can set the access token as follows:

```ts
const sdk = new RidgelineMarkets({ token: 'YOUR_TOKEN' });
```

If you need to set or update the access token after initializing the SDK, you can use:

```ts
const sdk = new RidgelineMarkets();
sdk.token = 'YOUR_TOKEN';
```

## Setting a Custom Timeout

You can set a custom timeout for the SDK's HTTP requests as follows:

```ts
const ridgelineMarkets = new RidgelineMarkets({ timeoutMs: 10000 });
```

# Sample Usage

Below is a comprehensive example demonstrating how to authenticate and call a simple endpoint:

```ts
import { RidgelineMarkets } from 'ridgeline-markets';

(async () => {
  const ridgelineMarkets = new RidgelineMarkets({
    token: 'YOUR_TOKEN',
  });

  const data = await ridgelineMarkets.markets.marketsGetEvents();

  console.log(data);
})();
```

## Services

The SDK provides various services to interact with the API.

<details>
<summary>Below is a list of all available services with links to their detailed documentation:</summary>

| Name                                                       |
| :--------------------------------------------------------- |
| [MarketsService](documentation/services/MarketsService.md) |

</details>

## Models

The SDK includes several models that represent the data structures used in API requests and responses. These models help in organizing and managing the data efficiently.

<details>
<summary>Below is a list of all available models with links to their detailed documentation:</summary>

| Name                                                                                                                 | Description |
| :------------------------------------------------------------------------------------------------------------------- | :---------- |
| [MarketsGetEventsOkResponse](documentation/models/MarketsGetEventsOkResponse.md)                                     |             |
| [MarketsGetEventsBadRequestResponse](documentation/models/MarketsGetEventsBadRequestResponse.md)                     |             |
| [MarketsGetEventsUnauthorizedResponse](documentation/models/MarketsGetEventsUnauthorizedResponse.md)                 |             |
| [MarketsGetEventsInternalServerErrorResponse](documentation/models/MarketsGetEventsInternalServerErrorResponse.md)   |             |
| [MarketsGetMarketsOkResponse](documentation/models/MarketsGetMarketsOkResponse.md)                                   |             |
| [MarketsGetMarketsBadRequestResponse](documentation/models/MarketsGetMarketsBadRequestResponse.md)                   |             |
| [MarketsGetMarketsUnauthorizedResponse](documentation/models/MarketsGetMarketsUnauthorizedResponse.md)               |             |
| [MarketsGetMarketsInternalServerErrorResponse](documentation/models/MarketsGetMarketsInternalServerErrorResponse.md) |             |

</details>
