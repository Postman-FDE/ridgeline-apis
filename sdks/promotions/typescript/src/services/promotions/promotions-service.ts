import { z } from 'zod';
import { BaseService } from '../base-service';
import { ContentType, HttpResponse, SdkConfig } from '../../http/types';
import { RequestBuilder } from '../../http/transport/request-builder';
import { SerializationStyle } from '../../http/serialization/base-serializer';
import { ThrowableError } from '../../http/errors/throwable-error';
import { Environment } from '../../http/environment';
import { PromotionsGetBoostsBadRequestResponse } from './models/promotions-get-boosts-bad-request-response';
import { PromotionsGetBoostsUnauthorizedResponse } from './models/promotions-get-boosts-unauthorized-response';
import { PromotionsGetBoostsInternalServerErrorResponse } from './models/promotions-get-boosts-internal-server-error-response';
import {
  PromotionsPostBoostsRequest,
  promotionsPostBoostsRequestRequest,
} from './models/promotions-post-boosts-request';
import { PromotionsPostBoostsBadRequestResponse } from './models/promotions-post-boosts-bad-request-response';
import { PromotionsPostBoostsUnauthorizedResponse } from './models/promotions-post-boosts-unauthorized-response';
import { PromotionsPostBoostsNotFoundResponse } from './models/promotions-post-boosts-not-found-response';
import { PromotionsPostBoostsInternalServerErrorResponse } from './models/promotions-post-boosts-internal-server-error-response';
import {
  PromotionsPostBoostsClaimRequest,
  promotionsPostBoostsClaimRequestRequest,
} from './models/promotions-post-boosts-claim-request';
import { PromotionsPostBoostsClaimBadRequestResponse } from './models/promotions-post-boosts-claim-bad-request-response';
import { PromotionsPostBoostsClaimUnauthorizedResponse } from './models/promotions-post-boosts-claim-unauthorized-response';
import { PromotionsPostBoostsClaimNotFoundResponse } from './models/promotions-post-boosts-claim-not-found-response';
import { PromotionsPostBoostsClaimInternalServerErrorResponse } from './models/promotions-post-boosts-claim-internal-server-error-response';
import { PromotionsGetBoostsClaimsBadRequestResponse } from './models/promotions-get-boosts-claims-bad-request-response';
import { PromotionsGetBoostsClaimsUnauthorizedResponse } from './models/promotions-get-boosts-claims-unauthorized-response';
import { PromotionsGetBoostsClaimsInternalServerErrorResponse } from './models/promotions-get-boosts-claims-internal-server-error-response';
import { PromotionsGetBoostsClaimsParams } from './request-params';

/**
 * Service class for PromotionsService operations.
 * Provides methods to interact with PromotionsService-related API endpoints.
 * All methods return promises and handle request/response serialization automatically.
 */
export class PromotionsService extends BaseService {
  protected promotionsGetBoostsConfig?: Partial<SdkConfig>;

  protected promotionsPostBoostsConfig?: Partial<SdkConfig>;

  protected promotionsPostBoostsClaimConfig?: Partial<SdkConfig>;

  protected promotionsGetBoostsClaimsConfig?: Partial<SdkConfig>;

  /**
   * Sets method-level configuration for promotionsGetBoosts.
   * @param config - Partial configuration to override service-level defaults
   * @returns This service instance for method chaining
   */
  setPromotionsGetBoostsConfig(config: Partial<SdkConfig>): this {
    this.promotionsGetBoostsConfig = config;
    return this;
  }

  /**
   * Sets method-level configuration for promotionsPostBoosts.
   * @param config - Partial configuration to override service-level defaults
   * @returns This service instance for method chaining
   */
  setPromotionsPostBoostsConfig(config: Partial<SdkConfig>): this {
    this.promotionsPostBoostsConfig = config;
    return this;
  }

  /**
   * Sets method-level configuration for promotionsPostBoostsClaim.
   * @param config - Partial configuration to override service-level defaults
   * @returns This service instance for method chaining
   */
  setPromotionsPostBoostsClaimConfig(config: Partial<SdkConfig>): this {
    this.promotionsPostBoostsClaimConfig = config;
    return this;
  }

  /**
   * Sets method-level configuration for promotionsGetBoostsClaims.
   * @param config - Partial configuration to override service-level defaults
   * @returns This service instance for method chaining
   */
  setPromotionsGetBoostsClaimsConfig(config: Partial<SdkConfig>): this {
    this.promotionsGetBoostsClaimsConfig = config;
    return this;
  }

  /**
 * List boosts.
**Errors** (with what a client or agent should do)

| Status | `error` | When | Recoverable | What to do |
|---|---|---|---|---|
| 400 | `missing_fields` | A required field is missing | yes | Fix the input: add the fields listed in `fields`, then retry. |
| 401 | `unauthorized` | Missing key, or another API's key | yes | Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. |
| 401 | `unresolved_reference` | A Passport reference skipped the proxy | yes | Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. |
 * @param {Partial<SdkConfig>} [requestConfig] - The request configuration for retry and validation.
 * @returns {Promise<HttpResponse<any>>} - Success
 */
  async promotionsGetBoosts(requestConfig?: Partial<SdkConfig>): Promise<any> {
    const resolvedConfig = this.getResolvedConfig(this.promotionsGetBoostsConfig, requestConfig);
    const request = new RequestBuilder()
      .setConfig(resolvedConfig)
      .setBaseUrl(resolvedConfig)
      .setMethod('GET')
      .setPath('/v1/boosts')
      .setRequestSchema(z.any())
      .addAccessTokenAuth(resolvedConfig?.token)
      .setRequestContentType(ContentType.Json)
      .addResponse({
        schema: z.any(),
        contentType: ContentType.Json,
        status: 200,
      })
      .addError({
        error: PromotionsGetBoostsBadRequestResponse,
        contentType: ContentType.Json,
        status: 400,
      })
      .addError({
        error: PromotionsGetBoostsUnauthorizedResponse,
        contentType: ContentType.Json,
        status: 401,
      })
      .addError({
        error: PromotionsGetBoostsInternalServerErrorResponse,
        contentType: ContentType.Json,
        status: 500,
      })
      .build();
    return this.client.callDirect<any>(request);
  }

  /**
 * Create a boost on a market. `profit_boost_pct` raises the profit of a winning bet; `rewards_back_pct` credits a share of the stake as rewards when the boosted bet is placed.
**Errors** (with what a client or agent should do)

| Status | `error` | When | Recoverable | What to do |
|---|---|---|---|---|
| 404 | `market_not_found` | Unknown `market_id`. | yes | Look up a valid `market_id` with markets `GET /v1/markets`, then retry. |
| 400 | `missing_fields` | A required field is missing | yes | Fix the input: add the fields listed in `fields`, then retry. |
| 401 | `unauthorized` | Missing key, or another API's key | yes | Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. |
| 401 | `unresolved_reference` | A Passport reference skipped the proxy | yes | Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. |
 * @param {Partial<SdkConfig>} [requestConfig] - The request configuration for retry and validation.
 * @returns {Promise<HttpResponse<any>>} - Success
 */
  async promotionsPostBoosts(
    body: PromotionsPostBoostsRequest,
    requestConfig?: Partial<SdkConfig>,
  ): Promise<any> {
    const resolvedConfig = this.getResolvedConfig(this.promotionsPostBoostsConfig, requestConfig);
    const request = new RequestBuilder()
      .setConfig(resolvedConfig)
      .setBaseUrl(resolvedConfig)
      .setMethod('POST')
      .setPath('/v1/boosts')
      .setRequestSchema(promotionsPostBoostsRequestRequest)
      .addAccessTokenAuth(resolvedConfig?.token)
      .setRequestContentType(ContentType.Json)
      .addResponse({
        schema: z.any(),
        contentType: ContentType.Json,
        status: 201,
      })
      .addError({
        error: PromotionsPostBoostsBadRequestResponse,
        contentType: ContentType.Json,
        status: 400,
      })
      .addError({
        error: PromotionsPostBoostsUnauthorizedResponse,
        contentType: ContentType.Json,
        status: 401,
      })
      .addError({
        error: PromotionsPostBoostsNotFoundResponse,
        contentType: ContentType.Json,
        status: 404,
      })
      .addError({
        error: PromotionsPostBoostsInternalServerErrorResponse,
        contentType: ContentType.Json,
        status: 500,
      })
      .addHeaderParam({ key: 'Content-Type', value: 'application/json' })
      .addBody(body)
      .build();
    return this.client.callDirect<any>(request);
  }

  /**
 * Claim a boost for a player. **The caller must check eligibility and location first.** This endpoint does not. Claiming twice returns the existing claim.
**Errors** (with what a client or agent should do)

| Status | `error` | When | Recoverable | What to do |
|---|---|---|---|---|
| 404 | `boost_not_found` | Unknown `boost_id`. | yes | Look up the boost with promotions `GET /v1/boosts`, or create it first. |
| 400 | `missing_fields` | A required field is missing | yes | Fix the input: add the fields listed in `fields`, then retry. |
| 401 | `unauthorized` | Missing key, or another API's key | yes | Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. |
| 401 | `unresolved_reference` | A Passport reference skipped the proxy | yes | Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. |
 * @param {Partial<SdkConfig>} [requestConfig] - The request configuration for retry and validation.
 * @returns {Promise<HttpResponse<any>>} - Success
 */
  async promotionsPostBoostsClaim(
    body: PromotionsPostBoostsClaimRequest,
    requestConfig?: Partial<SdkConfig>,
  ): Promise<any> {
    const resolvedConfig = this.getResolvedConfig(
      this.promotionsPostBoostsClaimConfig,
      requestConfig,
    );
    const request = new RequestBuilder()
      .setConfig(resolvedConfig)
      .setBaseUrl(resolvedConfig)
      .setMethod('POST')
      .setPath('/v1/boosts/claim')
      .setRequestSchema(promotionsPostBoostsClaimRequestRequest)
      .addAccessTokenAuth(resolvedConfig?.token)
      .setRequestContentType(ContentType.Json)
      .addResponse({
        schema: z.any(),
        contentType: ContentType.Json,
        status: 201,
      })
      .addError({
        error: PromotionsPostBoostsClaimBadRequestResponse,
        contentType: ContentType.Json,
        status: 400,
      })
      .addError({
        error: PromotionsPostBoostsClaimUnauthorizedResponse,
        contentType: ContentType.Json,
        status: 401,
      })
      .addError({
        error: PromotionsPostBoostsClaimNotFoundResponse,
        contentType: ContentType.Json,
        status: 404,
      })
      .addError({
        error: PromotionsPostBoostsClaimInternalServerErrorResponse,
        contentType: ContentType.Json,
        status: 500,
      })
      .addHeaderParam({ key: 'Content-Type', value: 'application/json' })
      .addBody(body)
      .build();
    return this.client.callDirect<any>(request);
  }

  /**
 * List claims, optionally for one `boost_id`. Use it to verify the end state after a campaign: no protected player should hold a claim.
**Errors** (with what a client or agent should do)

| Status | `error` | When | Recoverable | What to do |
|---|---|---|---|---|
| 400 | `missing_fields` | A required field is missing | yes | Fix the input: add the fields listed in `fields`, then retry. |
| 401 | `unauthorized` | Missing key, or another API's key | yes | Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. |
| 401 | `unresolved_reference` | A Passport reference skipped the proxy | yes | Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. |
 * @param {string} [params.boostId] - Filter by boost.
 * @param {Partial<SdkConfig>} [requestConfig] - The request configuration for retry and validation.
 * @returns {Promise<HttpResponse<any>>} - Success
 */
  async promotionsGetBoostsClaims(
    params?: PromotionsGetBoostsClaimsParams,
    requestConfig?: Partial<SdkConfig>,
  ): Promise<any> {
    const resolvedConfig = this.getResolvedConfig(
      this.promotionsGetBoostsClaimsConfig,
      requestConfig,
    );
    z.object({ boostId: z.string().optional() }).parse(params ?? {});
    const request = new RequestBuilder()
      .setConfig(resolvedConfig)
      .setBaseUrl(resolvedConfig)
      .setMethod('GET')
      .setPath('/v1/boosts/claims')
      .setRequestSchema(z.any())
      .addAccessTokenAuth(resolvedConfig?.token)
      .setRequestContentType(ContentType.Json)
      .addResponse({
        schema: z.any(),
        contentType: ContentType.Json,
        status: 200,
      })
      .addError({
        error: PromotionsGetBoostsClaimsBadRequestResponse,
        contentType: ContentType.Json,
        status: 400,
      })
      .addError({
        error: PromotionsGetBoostsClaimsUnauthorizedResponse,
        contentType: ContentType.Json,
        status: 401,
      })
      .addError({
        error: PromotionsGetBoostsClaimsInternalServerErrorResponse,
        contentType: ContentType.Json,
        status: 500,
      })
      .addQueryParam({
        key: 'boost_id',
        value: params?.boostId,
      })
      .build();
    return this.client.callDirect<any>(request);
  }
}
