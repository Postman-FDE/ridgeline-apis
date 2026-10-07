import { z } from 'zod';
import { BaseService } from '../base-service';
import { ContentType, HttpResponse, SdkConfig } from '../../http/types';
import { RequestBuilder } from '../../http/transport/request-builder';
import { SerializationStyle } from '../../http/serialization/base-serializer';
import { ThrowableError } from '../../http/errors/throwable-error';
import { Environment } from '../../http/environment';
import {
  WalletPostWalletBalanceRequest,
  walletPostWalletBalanceRequestRequest,
} from './models/wallet-post-wallet-balance-request';
import { WalletPostWalletBalanceBadRequestResponse } from './models/wallet-post-wallet-balance-bad-request-response';
import { WalletPostWalletBalanceUnauthorizedResponse } from './models/wallet-post-wallet-balance-unauthorized-response';
import { WalletPostWalletBalanceNotFoundResponse } from './models/wallet-post-wallet-balance-not-found-response';
import { WalletPostWalletBalanceInternalServerErrorResponse } from './models/wallet-post-wallet-balance-internal-server-error-response';
import {
  WalletPostWalletRewardsCreditRequest,
  walletPostWalletRewardsCreditRequestRequest,
} from './models/wallet-post-wallet-rewards-credit-request';
import { WalletPostWalletRewardsCreditBadRequestResponse } from './models/wallet-post-wallet-rewards-credit-bad-request-response';
import { WalletPostWalletRewardsCreditUnauthorizedResponse } from './models/wallet-post-wallet-rewards-credit-unauthorized-response';
import { WalletPostWalletRewardsCreditNotFoundResponse } from './models/wallet-post-wallet-rewards-credit-not-found-response';
import { WalletPostWalletRewardsCreditInternalServerErrorResponse } from './models/wallet-post-wallet-rewards-credit-internal-server-error-response';

/**
 * Service class for WalletService operations.
 * Provides methods to interact with WalletService-related API endpoints.
 * All methods return promises and handle request/response serialization automatically.
 */
export class WalletService extends BaseService {
  protected walletPostWalletBalanceConfig?: Partial<SdkConfig>;

  protected walletPostWalletRewardsCreditConfig?: Partial<SdkConfig>;

  /**
   * Sets method-level configuration for walletPostWalletBalance.
   * @param config - Partial configuration to override service-level defaults
   * @returns This service instance for method chaining
   */
  setWalletPostWalletBalanceConfig(config: Partial<SdkConfig>): this {
    this.walletPostWalletBalanceConfig = config;
    return this;
  }

  /**
   * Sets method-level configuration for walletPostWalletRewardsCredit.
   * @param config - Partial configuration to override service-level defaults
   * @returns This service instance for method chaining
   */
  setWalletPostWalletRewardsCreditConfig(config: Partial<SdkConfig>): this {
    this.walletPostWalletRewardsCreditConfig = config;
    return this;
  }

  /**
 * Get a player's current balances.
**Errors** (with what a client or agent should do)

| Status | `error` | When | Recoverable | What to do |
|---|---|---|---|---|
| 404 | `player_not_found` | Unknown `player_id`. | no | Stop: the player ID is wrong. Do not guess another ID. |
| 400 | `missing_fields` | A required field is missing | yes | Fix the input: add the fields listed in `fields`, then retry. |
| 401 | `unauthorized` | Missing key, or another API's key | yes | Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. |
| 401 | `unresolved_reference` | A Passport reference skipped the proxy | yes | Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. |
 * @param {Partial<SdkConfig>} [requestConfig] - The request configuration for retry and validation.
 * @returns {Promise<HttpResponse<any>>} - Success
 */
  async walletPostWalletBalance(
    body: WalletPostWalletBalanceRequest,
    requestConfig?: Partial<SdkConfig>,
  ): Promise<any> {
    const resolvedConfig = this.getResolvedConfig(
      this.walletPostWalletBalanceConfig,
      requestConfig,
    );
    const request = new RequestBuilder()
      .setConfig(resolvedConfig)
      .setBaseUrl(resolvedConfig)
      .setMethod('POST')
      .setPath('/v1/wallet/balance')
      .setRequestSchema(walletPostWalletBalanceRequestRequest)
      .addAccessTokenAuth(resolvedConfig?.token)
      .setRequestContentType(ContentType.Json)
      .addResponse({
        schema: z.any(),
        contentType: ContentType.Json,
        status: 200,
      })
      .addError({
        error: WalletPostWalletBalanceBadRequestResponse,
        contentType: ContentType.Json,
        status: 400,
      })
      .addError({
        error: WalletPostWalletBalanceUnauthorizedResponse,
        contentType: ContentType.Json,
        status: 401,
      })
      .addError({
        error: WalletPostWalletBalanceNotFoundResponse,
        contentType: ContentType.Json,
        status: 404,
      })
      .addError({
        error: WalletPostWalletBalanceInternalServerErrorResponse,
        contentType: ContentType.Json,
        status: 500,
      })
      .addHeaderParam({ key: 'Content-Type', value: 'application/json' })
      .addBody(body)
      .build();
    return this.client.callDirect<any>(request);
  }

  /**
 * Credit rewards to a player. Idempotent on `idempotency_key`: the first call credits, replays return the current balance unchanged. **Check `player-limits` first.** Protected players (`may_receive_promotions: false`) must not receive promotional credits.
**Errors** (with what a client or agent should do)

| Status | `error` | When | Recoverable | What to do |
|---|---|---|---|---|
| 400 | `invalid_amount` | `amount_minor` is not a positive integer. | yes | Fix the input: send a positive integer in cents (e.g. 1000), then retry. |
| 404 | `player_not_found` | Unknown `player_id`. | no | Stop: the player ID is wrong. Do not guess another ID. |
| 400 | `missing_fields` | A required field is missing | yes | Fix the input: add the fields listed in `fields`, then retry. |
| 401 | `unauthorized` | Missing key, or another API's key | yes | Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. |
| 401 | `unresolved_reference` | A Passport reference skipped the proxy | yes | Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. |
 * @param {Partial<SdkConfig>} [requestConfig] - The request configuration for retry and validation.
 * @returns {Promise<HttpResponse<any>>} - Success
 */
  async walletPostWalletRewardsCredit(
    body: WalletPostWalletRewardsCreditRequest,
    requestConfig?: Partial<SdkConfig>,
  ): Promise<any> {
    const resolvedConfig = this.getResolvedConfig(
      this.walletPostWalletRewardsCreditConfig,
      requestConfig,
    );
    const request = new RequestBuilder()
      .setConfig(resolvedConfig)
      .setBaseUrl(resolvedConfig)
      .setMethod('POST')
      .setPath('/v1/wallet/rewards/credit')
      .setRequestSchema(walletPostWalletRewardsCreditRequestRequest)
      .addAccessTokenAuth(resolvedConfig?.token)
      .setRequestContentType(ContentType.Json)
      .addResponse({
        schema: z.any(),
        contentType: ContentType.Json,
        status: 201,
      })
      .addError({
        error: WalletPostWalletRewardsCreditBadRequestResponse,
        contentType: ContentType.Json,
        status: 400,
      })
      .addError({
        error: WalletPostWalletRewardsCreditUnauthorizedResponse,
        contentType: ContentType.Json,
        status: 401,
      })
      .addError({
        error: WalletPostWalletRewardsCreditNotFoundResponse,
        contentType: ContentType.Json,
        status: 404,
      })
      .addError({
        error: WalletPostWalletRewardsCreditInternalServerErrorResponse,
        contentType: ContentType.Json,
        status: 500,
      })
      .addHeaderParam({ key: 'Content-Type', value: 'application/json' })
      .addBody(body)
      .build();
    return this.client.callDirect<any>(request);
  }
}
