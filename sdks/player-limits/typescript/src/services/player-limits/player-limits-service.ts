import { z } from 'zod';
import { BaseService } from '../base-service';
import { ContentType, HttpResponse, SdkConfig } from '../../http/types';
import { RequestBuilder } from '../../http/transport/request-builder';
import { SerializationStyle } from '../../http/serialization/base-serializer';
import { ThrowableError } from '../../http/errors/throwable-error';
import { Environment } from '../../http/environment';
import {
  PlayerLimitsPostEligibilityCheckRequest,
  playerLimitsPostEligibilityCheckRequestRequest,
} from './models/player-limits-post-eligibility-check-request';
import {
  PlayerLimitsPostEligibilityCheckOkResponse,
  playerLimitsPostEligibilityCheckOkResponseResponse,
} from './models/player-limits-post-eligibility-check-ok-response';
import { PlayerLimitsPostEligibilityCheckBadRequestResponse } from './models/player-limits-post-eligibility-check-bad-request-response';
import { PlayerLimitsPostEligibilityCheckUnauthorizedResponse } from './models/player-limits-post-eligibility-check-unauthorized-response';
import { PlayerLimitsPostEligibilityCheckNotFoundResponse } from './models/player-limits-post-eligibility-check-not-found-response';
import { PlayerLimitsPostEligibilityCheckInternalServerErrorResponse } from './models/player-limits-post-eligibility-check-internal-server-error-response';
import {
  PlayerLimitsPostLimitsRequest,
  playerLimitsPostLimitsRequestRequest,
} from './models/player-limits-post-limits-request';
import { PlayerLimitsPostLimitsBadRequestResponse } from './models/player-limits-post-limits-bad-request-response';
import { PlayerLimitsPostLimitsUnauthorizedResponse } from './models/player-limits-post-limits-unauthorized-response';
import { PlayerLimitsPostLimitsNotFoundResponse } from './models/player-limits-post-limits-not-found-response';
import { PlayerLimitsPostLimitsInternalServerErrorResponse } from './models/player-limits-post-limits-internal-server-error-response';

/**
 * Service class for PlayerLimitsService operations.
 * Provides methods to interact with PlayerLimitsService-related API endpoints.
 * All methods return promises and handle request/response serialization automatically.
 */
export class PlayerLimitsService extends BaseService {
  protected playerLimitsPostEligibilityCheckConfig?: Partial<SdkConfig>;

  protected playerLimitsPostLimitsConfig?: Partial<SdkConfig>;

  /**
   * Sets method-level configuration for playerLimitsPostEligibilityCheck.
   * @param config - Partial configuration to override service-level defaults
   * @returns This service instance for method chaining
   */
  setPlayerLimitsPostEligibilityCheckConfig(config: Partial<SdkConfig>): this {
    this.playerLimitsPostEligibilityCheckConfig = config;
    return this;
  }

  /**
   * Sets method-level configuration for playerLimitsPostLimits.
   * @param config - Partial configuration to override service-level defaults
   * @returns This service instance for method chaining
   */
  setPlayerLimitsPostLimitsConfig(config: Partial<SdkConfig>): this {
    this.playerLimitsPostLimitsConfig = config;
    return this;
  }

  /**
 * Check a player before any wager, offer, boost or claim. Pass `amount_minor` to include the daily-limit check. A player can be ineligible for a wager (`DAILY_WAGER_LIMIT`) yet still allowed promotions.
**Errors** (with what a client or agent should do)

| Status | `error` | When | Recoverable | What to do |
|---|---|---|---|---|
| 400 | `invalid_product` | `product` is not `sportsbook` or `casino`. | yes | Fix the input: use `sportsbook` or `casino`. |
| 404 | `player_not_found` | Unknown `player_id`. | no | Stop: the player ID is wrong. Do not guess another ID. |
| 400 | `missing_fields` | A required field is missing | yes | Fix the input: add the fields listed in `fields`, then retry. |
| 401 | `unauthorized` | Missing key, or another API's key | yes | Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. |
| 401 | `unresolved_reference` | A Passport reference skipped the proxy | yes | Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. |
 * @param {Partial<SdkConfig>} [requestConfig] - The request configuration for retry and validation.
 * @returns {Promise<HttpResponse<PlayerLimitsPostEligibilityCheckOkResponse>>} - Success
 */
  async playerLimitsPostEligibilityCheck(
    body: PlayerLimitsPostEligibilityCheckRequest,
    requestConfig?: Partial<SdkConfig>,
  ): Promise<PlayerLimitsPostEligibilityCheckOkResponse> {
    const resolvedConfig = this.getResolvedConfig(
      this.playerLimitsPostEligibilityCheckConfig,
      requestConfig,
    );
    const request = new RequestBuilder()
      .setConfig(resolvedConfig)
      .setBaseUrl(resolvedConfig)
      .setMethod('POST')
      .setPath('/v1/eligibility/check')
      .setRequestSchema(playerLimitsPostEligibilityCheckRequestRequest)
      .addAccessTokenAuth(resolvedConfig?.token)
      .setRequestContentType(ContentType.Json)
      .addResponse({
        schema: playerLimitsPostEligibilityCheckOkResponseResponse,
        contentType: ContentType.Json,
        status: 200,
      })
      .addError({
        error: PlayerLimitsPostEligibilityCheckBadRequestResponse,
        contentType: ContentType.Json,
        status: 400,
      })
      .addError({
        error: PlayerLimitsPostEligibilityCheckUnauthorizedResponse,
        contentType: ContentType.Json,
        status: 401,
      })
      .addError({
        error: PlayerLimitsPostEligibilityCheckNotFoundResponse,
        contentType: ContentType.Json,
        status: 404,
      })
      .addError({
        error: PlayerLimitsPostEligibilityCheckInternalServerErrorResponse,
        contentType: ContentType.Json,
        status: 500,
      })
      .addHeaderParam({ key: 'Content-Type', value: 'application/json' })
      .addBody(body)
      .build();
    return this.client.callDirect<PlayerLimitsPostEligibilityCheckOkResponse>(request);
  }

  /**
 * Get a player's protection status and daily limit usage.
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
  async playerLimitsPostLimits(
    body: PlayerLimitsPostLimitsRequest,
    requestConfig?: Partial<SdkConfig>,
  ): Promise<any> {
    const resolvedConfig = this.getResolvedConfig(this.playerLimitsPostLimitsConfig, requestConfig);
    const request = new RequestBuilder()
      .setConfig(resolvedConfig)
      .setBaseUrl(resolvedConfig)
      .setMethod('POST')
      .setPath('/v1/limits')
      .setRequestSchema(playerLimitsPostLimitsRequestRequest)
      .addAccessTokenAuth(resolvedConfig?.token)
      .setRequestContentType(ContentType.Json)
      .addResponse({
        schema: z.any(),
        contentType: ContentType.Json,
        status: 200,
      })
      .addError({
        error: PlayerLimitsPostLimitsBadRequestResponse,
        contentType: ContentType.Json,
        status: 400,
      })
      .addError({
        error: PlayerLimitsPostLimitsUnauthorizedResponse,
        contentType: ContentType.Json,
        status: 401,
      })
      .addError({
        error: PlayerLimitsPostLimitsNotFoundResponse,
        contentType: ContentType.Json,
        status: 404,
      })
      .addError({
        error: PlayerLimitsPostLimitsInternalServerErrorResponse,
        contentType: ContentType.Json,
        status: 500,
      })
      .addHeaderParam({ key: 'Content-Type', value: 'application/json' })
      .addBody(body)
      .build();
    return this.client.callDirect<any>(request);
  }
}
