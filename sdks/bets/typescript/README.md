# RidgelineBets TypeScript SDK 2.0.0

Welcome to the RidgelineBets SDK documentation. This guide will help you get started with integrating and using the RidgelineBets SDK in your project.

## Versions

- SDK version: `2.0.0`

## About the API

Bet placement. **v2 (2026-07): `stake` (decimal dollars) was removed and replaced by `stake_minor` (integer cents).** Requests containing `stake` are rejected. Bets re-checks eligibility and location at placement as a safety net; it does not replace checking before an offer.

**Bet placement**, single or parlay, optionally with a claimed boost.

**Owner:** Team Bet Platform · **Consumers:** bet-slip, sportsbook-app (contract tested)

### v2 (2026-07): breaking change

`stake` (decimal dollars) was **removed** and replaced by `stake_minor` (integer cents). Requests that still send `stake` are rejected with `400 unsupported_field` and a `replacement` hint. The v1 spec is kept in history for reference.

### Safety nets

At placement, bets re-checks **geo-compliance** and **player-limits** and rejects with `403`. This is a backstop, not a substitute: callers must still check eligibility **before** showing an offer.

### Payout math

`potential_payout_minor = stake_minor + stake_minor × (decimal_odds − 1) × (1 + profit_boost_pct/100)`, rounded. Parlays multiply decimal odds.

## Authentication

Send `Authorization: Bearer <key>`. **Each API has its own key**, and a key for one API is rejected by the others.

Keys are never handed out directly. Request access and you receive a **credential reference** such as `{{vault:RIDGELINE_BETS_KEY}}`. A secure access proxy (Postman Passport) swaps the reference for the real key at call time, so neither your code, your agent nor its logs ever hold the secret.

| Response                   | Meaning                                                                            |
| -------------------------- | ---------------------------------------------------------------------------------- |
| `401 unauthorized`         | Missing key, or a key for a different API                                          |
| `401 unresolved_reference` | A `{{vault:...}}` reference reached the API unresolved: the call skipped the proxy |

## Getting access (credential acquisition)

1. **Find the API** in the Postman API Catalog (or the Ridgeline Sandbox workspace): **Bets API**, owned by **Team Bet Platform**.
2. **Request access** in Postman Passport: namespace **Ridgeline Sandbox**, resource group **Bets API**. Pick the shortest duration that covers the job and give a reason.
3. **Wait for approval** from Team Bet Platform. The grant is scoped to this API's endpoints (method + host + path) and expires on its own.
4. **Use the reference**, not a key: `passport whoami` shows it, e.g. `{{vault:RIDGELINE_BETS_KEY}}`. Send it as `Authorization: Bearer {{vault:RIDGELINE_BETS_KEY}}` through the Passport proxy.

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
npm install ridgeline-bets
```

or

```bash
yarn add ridgeline-bets
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

The RidgelineBets API uses an Access Token for authentication.

This token must be provided to authenticate your requests to the API.

#### Setting the Access Token

When you initialize the SDK, you can set the access token as follows:

```ts
const sdk = new RidgelineBets({ token: 'YOUR_TOKEN' });
```

If you need to set or update the access token after initializing the SDK, you can use:

```ts
const sdk = new RidgelineBets();
sdk.token = 'YOUR_TOKEN';
```

## Setting a Custom Timeout

You can set a custom timeout for the SDK's HTTP requests as follows:

```ts
const ridgelineBets = new RidgelineBets({ timeoutMs: 10000 });
```

# Sample Usage

Below is a comprehensive example demonstrating how to authenticate and call a simple endpoint:

```ts
import { RidgelineBets } from 'ridgeline-bets';

(async () => {
  const ridgelineBets = new RidgelineBets({
    token: 'YOUR_TOKEN',
  });

  const data = await ridgelineBets.bets.betsGetBets({
    playerId: 'player_id',
  });

  console.log(data);
})();
```

## Services

The SDK provides various services to interact with the API.

<details>
<summary>Below is a list of all available services with links to their detailed documentation:</summary>

| Name                                                 |
| :--------------------------------------------------- |
| [BetsService](documentation/services/BetsService.md) |

</details>

## Models

The SDK includes several models that represent the data structures used in API requests and responses. These models help in organizing and managing the data efficiently.

<details>
<summary>Below is a list of all available models with links to their detailed documentation:</summary>

| Name                                                                                                       | Description |
| :--------------------------------------------------------------------------------------------------------- | :---------- |
| [BetsGetBetsBadRequestResponse](documentation/models/BetsGetBetsBadRequestResponse.md)                     |             |
| [BetsGetBetsUnauthorizedResponse](documentation/models/BetsGetBetsUnauthorizedResponse.md)                 |             |
| [BetsGetBetsInternalServerErrorResponse](documentation/models/BetsGetBetsInternalServerErrorResponse.md)   |             |
| [BetsPostBetsCreatedResponse](documentation/models/BetsPostBetsCreatedResponse.md)                         |             |
| [BetsPostBetsRequest](documentation/models/BetsPostBetsRequest.md)                                         |             |
| [BetsPostBetsBadRequestResponse](documentation/models/BetsPostBetsBadRequestResponse.md)                   |             |
| [BetsPostBetsUnauthorizedResponse](documentation/models/BetsPostBetsUnauthorizedResponse.md)               |             |
| [BetsPostBetsForbiddenResponse](documentation/models/BetsPostBetsForbiddenResponse.md)                     |             |
| [BetsPostBetsNotFoundResponse](documentation/models/BetsPostBetsNotFoundResponse.md)                       |             |
| [BetsPostBetsConflictResponse](documentation/models/BetsPostBetsConflictResponse.md)                       |             |
| [BetsPostBetsInternalServerErrorResponse](documentation/models/BetsPostBetsInternalServerErrorResponse.md) |             |

</details>
