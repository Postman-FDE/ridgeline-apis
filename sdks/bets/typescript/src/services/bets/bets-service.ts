import { z } from 'zod';
import { BaseService } from '../base-service';
import { ContentType, HttpResponse, SdkConfig } from '../../http/types';
import { RequestBuilder } from '../../http/transport/request-builder';
import { SerializationStyle } from '../../http/serialization/base-serializer';
import { ThrowableError } from '../../http/errors/throwable-error';
import { Environment } from '../../http/environment';
import { BetsGetBetsBadRequestResponse } from './models/bets-get-bets-bad-request-response';
import { BetsGetBetsUnauthorizedResponse } from './models/bets-get-bets-unauthorized-response';
import { BetsGetBetsInternalServerErrorResponse } from './models/bets-get-bets-internal-server-error-response';
import { BetsGetBetsParams } from './request-params';
import { BetsPostBetsRequest, betsPostBetsRequestRequest } from './models/bets-post-bets-request';
import {
  BetsPostBetsCreatedResponse,
  betsPostBetsCreatedResponseResponse,
} from './models/bets-post-bets-created-response';
import { BetsPostBetsBadRequestResponse } from './models/bets-post-bets-bad-request-response';
import { BetsPostBetsUnauthorizedResponse } from './models/bets-post-bets-unauthorized-response';
import { BetsPostBetsForbiddenResponse } from './models/bets-post-bets-forbidden-response';
import { BetsPostBetsNotFoundResponse } from './models/bets-post-bets-not-found-response';
import { BetsPostBetsConflictResponse } from './models/bets-post-bets-conflict-response';
import { BetsPostBetsInternalServerErrorResponse } from './models/bets-post-bets-internal-server-error-response';

/**
 * Service class for BetsService operations.
 * Provides methods to interact with BetsService-related API endpoints.
 * All methods return promises and handle request/response serialization automatically.
 */
export class BetsService extends BaseService {
  protected betsGetBetsConfig?: Partial<SdkConfig>;

  protected betsPostBetsConfig?: Partial<SdkConfig>;

  /**
   * Sets method-level configuration for betsGetBets.
   * @param config - Partial configuration to override service-level defaults
   * @returns This service instance for method chaining
   */
  setBetsGetBetsConfig(config: Partial<SdkConfig>): this {
    this.betsGetBetsConfig = config;
    return this;
  }

  /**
   * Sets method-level configuration for betsPostBets.
   * @param config - Partial configuration to override service-level defaults
   * @returns This service instance for method chaining
   */
  setBetsPostBetsConfig(config: Partial<SdkConfig>): this {
    this.betsPostBetsConfig = config;
    return this;
  }

  /**
 * List bets, optionally for one `player_id`.
**Errors** (with what a client or agent should do)

| Status | `error` | When | Recoverable | What to do |
|---|---|---|---|---|
| 400 | `missing_fields` | A required field is missing | yes | Fix the input: add the fields listed in `fields`, then retry. |
| 401 | `unauthorized` | Missing key, or another API's key | yes | Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. |
| 401 | `unresolved_reference` | A Passport reference skipped the proxy | yes | Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. |
 * @param {string} [params.playerId] - Filter by player.
 * @param {Partial<SdkConfig>} [requestConfig] - The request configuration for retry and validation.
 * @returns {Promise<HttpResponse<any>>} - Success
 */
  async betsGetBets(params?: BetsGetBetsParams, requestConfig?: Partial<SdkConfig>): Promise<any> {
    const resolvedConfig = this.getResolvedConfig(this.betsGetBetsConfig, requestConfig);
    z.object({ playerId: z.string().optional() }).parse(params ?? {});
    const request = new RequestBuilder()
      .setConfig(resolvedConfig)
      .setBaseUrl(resolvedConfig)
      .setMethod('GET')
      .setPath('/v1/bets')
      .setRequestSchema(z.any())
      .addAccessTokenAuth(resolvedConfig?.token)
      .setRequestContentType(ContentType.Json)
      .addResponse({
        schema: z.any(),
        contentType: ContentType.Json,
        status: 200,
      })
      .addError({
        error: BetsGetBetsBadRequestResponse,
        contentType: ContentType.Json,
        status: 400,
      })
      .addError({
        error: BetsGetBetsUnauthorizedResponse,
        contentType: ContentType.Json,
        status: 401,
      })
      .addError({
        error: BetsGetBetsInternalServerErrorResponse,
        contentType: ContentType.Json,
        status: 500,
      })
      .addQueryParam({
        key: 'player_id',
        value: params?.playerId,
      })
      .build();
    return this.client.callDirect<any>(request);
  }

  /**
 * Place a bet. Send `stake_minor` in cents. To apply a boost, the player must have claimed it via promotions first.
**Errors** (with what a client or agent should do)

| Status | `error` | When | Recoverable | What to do |
|---|---|---|---|---|
| 400 | `unsupported_field` | The request contains the removed v1 `stake` field. The error includes `"replacement": "stake_minor"`. | yes | Fix the input: rename the field to the one in `replacement` (e.g. `stake` to `stake_minor`, in cents). |
| 400 | `invalid_amount` | `stake_minor` is not a positive integer. | yes | Fix the input: send a positive integer in cents (e.g. 1000), then retry. |
| 403 | `player_not_eligible` | Player-limits rejected the wager. `reasons` lists why (e.g. `SELF_EXCLUDED`). | no | Stop: player protection blocked this. Do not retry, do not offer an alternative promotion, and report the `reasons`. |
| 403 | `product_not_available` | The product is not available in the player's state. | no | Stop for this product: it is not available in the player's state. Another product may be. |
| 404 | `selection_not_found` | Unknown `market_id` / `outcome_id`. | yes | Look up valid outcomes with markets `GET /v1/markets`, then retry. |
| 409 | `boost_not_claimed` | `boost_id` given but the player has not claimed it. | yes | Check eligibility, claim the boost with promotions `POST /v1/boosts/claim`, then retry the bet. |
| 400 | `missing_fields` | A required field is missing | yes | Fix the input: add the fields listed in `fields`, then retry. |
| 401 | `unauthorized` | Missing key, or another API's key | yes | Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. |
| 401 | `unresolved_reference` | A Passport reference skipped the proxy | yes | Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. |
 * @param {Partial<SdkConfig>} [requestConfig] - The request configuration for retry and validation.
 * @returns {Promise<HttpResponse<BetsPostBetsCreatedResponse>>} - Success
 */
  async betsPostBets(
    body: BetsPostBetsRequest,
    requestConfig?: Partial<SdkConfig>,
  ): Promise<BetsPostBetsCreatedResponse> {
    const resolvedConfig = this.getResolvedConfig(this.betsPostBetsConfig, requestConfig);
    const request = new RequestBuilder()
      .setConfig(resolvedConfig)
      .setBaseUrl(resolvedConfig)
      .setMethod('POST')
      .setPath('/v1/bets')
      .setRequestSchema(betsPostBetsRequestRequest)
      .addAccessTokenAuth(resolvedConfig?.token)
      .setRequestContentType(ContentType.Json)
      .addResponse({
        schema: betsPostBetsCreatedResponseResponse,
        contentType: ContentType.Json,
        status: 201,
      })
      .addError({
        error: BetsPostBetsBadRequestResponse,
        contentType: ContentType.Json,
        status: 400,
      })
      .addError({
        error: BetsPostBetsUnauthorizedResponse,
        contentType: ContentType.Json,
        status: 401,
      })
      .addError({
        error: BetsPostBetsForbiddenResponse,
        contentType: ContentType.Json,
        status: 403,
      })
      .addError({
        error: BetsPostBetsNotFoundResponse,
        contentType: ContentType.Json,
        status: 404,
      })
      .addError({
        error: BetsPostBetsConflictResponse,
        contentType: ContentType.Json,
        status: 409,
      })
      .addError({
        error: BetsPostBetsInternalServerErrorResponse,
        contentType: ContentType.Json,
        status: 500,
      })
      .addHeaderParam({ key: 'Content-Type', value: 'application/json' })
      .addBody(body)
      .build();
    return this.client.callDirect<BetsPostBetsCreatedResponse>(request);
  }
}
