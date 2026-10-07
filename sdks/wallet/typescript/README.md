# RidgelineWallet TypeScript SDK 1.0.0

Welcome to the RidgelineWallet SDK documentation. This guide will help you get started with integrating and using the RidgelineWallet SDK in your project.

## Versions

- SDK version: `1.0.0`

## About the API

Player balances (cash, bonus, rewards) and rewards credits. All amounts are integer minor units (cents).

Player balances (**cash**, **bonus**, **rewards**) and **rewards credits**. All amounts are integer cents.

**Owner:** Team Payments · **Consumers:** bet-slip, promotions tooling, agents that issue rewards

Rewards credits are **idempotent**: send a unique `idempotency_key` per credit, and replaying a key never credits twice. Agents that move value should always generate a fresh key per intended credit.

## Authentication

Send `Authorization: Bearer <key>`. **Each API has its own key**, and a key for one API is rejected by the others.

Keys are never handed out directly. Request access and you receive a **credential reference** such as `{{vault:RIDGELINE_BETS_KEY}}`. A secure access proxy (Postman Passport) swaps the reference for the real key at call time, so neither your code, your agent nor its logs ever hold the secret.

| Response                   | Meaning                                                                            |
| -------------------------- | ---------------------------------------------------------------------------------- |
| `401 unauthorized`         | Missing key, or a key for a different API                                          |
| `401 unresolved_reference` | A `{{vault:...}}` reference reached the API unresolved: the call skipped the proxy |

## Getting access (credential acquisition)

1. **Find the API** in the Postman API Catalog (or the Ridgeline Sandbox workspace): **Wallet API**, owned by **Team Payments**.
2. **Request access** in Postman Passport: namespace **Ridgeline Sandbox**, resource group **Wallet API**. Pick the shortest duration that covers the job and give a reason.
3. **Wait for approval** from Team Payments. The grant is scoped to this API's endpoints (method + host + path) and expires on its own.
4. **Use the reference**, not a key: `passport whoami` shows it, e.g. `{{vault:RIDGELINE_WALLET_KEY}}`. Send it as `Authorization: Bearer {{vault:RIDGELINE_WALLET_KEY}}` through the Passport proxy.

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
npm install ridgeline-wallet
```

or

```bash
yarn add ridgeline-wallet
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

The RidgelineWallet API uses an Access Token for authentication.

This token must be provided to authenticate your requests to the API.

#### Setting the Access Token

When you initialize the SDK, you can set the access token as follows:

```ts
const sdk = new RidgelineWallet({ token: 'YOUR_TOKEN' });
```

If you need to set or update the access token after initializing the SDK, you can use:

```ts
const sdk = new RidgelineWallet();
sdk.token = 'YOUR_TOKEN';
```

## Setting a Custom Timeout

You can set a custom timeout for the SDK's HTTP requests as follows:

```ts
const ridgelineWallet = new RidgelineWallet({ timeoutMs: 10000 });
```

# Sample Usage

Below is a comprehensive example demonstrating how to authenticate and call a simple endpoint:

```ts
import { RidgelineWallet, WalletPostWalletBalanceRequest } from 'ridgeline-wallet';

(async () => {
  const ridgelineWallet = new RidgelineWallet({
    token: 'YOUR_TOKEN',
  });

  const walletPostWalletBalanceRequest: WalletPostWalletBalanceRequest = {
    playerId: 'player_id',
  };

  const data = await ridgelineWallet.wallet.walletPostWalletBalance(walletPostWalletBalanceRequest);

  console.log(data);
})();
```

## Services

The SDK provides various services to interact with the API.

<details>
<summary>Below is a list of all available services with links to their detailed documentation:</summary>

| Name                                                     |
| :------------------------------------------------------- |
| [WalletService](documentation/services/WalletService.md) |

</details>

## Models

The SDK includes several models that represent the data structures used in API requests and responses. These models help in organizing and managing the data efficiently.

<details>
<summary>Below is a list of all available models with links to their detailed documentation:</summary>

| Name                                                                                                                                         | Description |
| :------------------------------------------------------------------------------------------------------------------------------------------- | :---------- |
| [WalletPostWalletBalanceRequest](documentation/models/WalletPostWalletBalanceRequest.md)                                                     |             |
| [WalletPostWalletBalanceBadRequestResponse](documentation/models/WalletPostWalletBalanceBadRequestResponse.md)                               |             |
| [WalletPostWalletBalanceUnauthorizedResponse](documentation/models/WalletPostWalletBalanceUnauthorizedResponse.md)                           |             |
| [WalletPostWalletBalanceNotFoundResponse](documentation/models/WalletPostWalletBalanceNotFoundResponse.md)                                   |             |
| [WalletPostWalletBalanceInternalServerErrorResponse](documentation/models/WalletPostWalletBalanceInternalServerErrorResponse.md)             |             |
| [WalletPostWalletRewardsCreditRequest](documentation/models/WalletPostWalletRewardsCreditRequest.md)                                         |             |
| [WalletPostWalletRewardsCreditBadRequestResponse](documentation/models/WalletPostWalletRewardsCreditBadRequestResponse.md)                   |             |
| [WalletPostWalletRewardsCreditUnauthorizedResponse](documentation/models/WalletPostWalletRewardsCreditUnauthorizedResponse.md)               |             |
| [WalletPostWalletRewardsCreditNotFoundResponse](documentation/models/WalletPostWalletRewardsCreditNotFoundResponse.md)                       |             |
| [WalletPostWalletRewardsCreditInternalServerErrorResponse](documentation/models/WalletPostWalletRewardsCreditInternalServerErrorResponse.md) |             |

</details>
