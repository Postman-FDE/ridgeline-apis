import { z } from 'zod';
import { BaseService } from '../base-service';
import { ContentType, HttpResponse, SdkConfig } from '../../http/types';
import { RequestBuilder } from '../../http/transport/request-builder';
import { SerializationStyle } from '../../http/serialization/base-serializer';
import { ThrowableError } from '../../http/errors/throwable-error';
import { Environment } from '../../http/environment';
import {
  MarketsGetEventsOkResponse,
  marketsGetEventsOkResponseResponse,
} from './models/markets-get-events-ok-response';
import { MarketsGetEventsBadRequestResponse } from './models/markets-get-events-bad-request-response';
import { MarketsGetEventsUnauthorizedResponse } from './models/markets-get-events-unauthorized-response';
import { MarketsGetEventsInternalServerErrorResponse } from './models/markets-get-events-internal-server-error-response';
import {
  MarketsGetMarketsOkResponse,
  marketsGetMarketsOkResponseResponse,
} from './models/markets-get-markets-ok-response';
import { MarketsGetMarketsBadRequestResponse } from './models/markets-get-markets-bad-request-response';
import { MarketsGetMarketsUnauthorizedResponse } from './models/markets-get-markets-unauthorized-response';
import { MarketsGetMarketsInternalServerErrorResponse } from './models/markets-get-markets-internal-server-error-response';
import { MarketsGetMarketsParams } from './request-params';

/**
 * Service class for MarketsService operations.
 * Provides methods to interact with MarketsService-related API endpoints.
 * All methods return promises and handle request/response serialization automatically.
 */
export class MarketsService extends BaseService {
  protected marketsGetEventsConfig?: Partial<SdkConfig>;

  protected marketsGetMarketsConfig?: Partial<SdkConfig>;

  /**
   * Sets method-level configuration for marketsGetEvents.
   * @param config - Partial configuration to override service-level defaults
   * @returns This service instance for method chaining
   */
  setMarketsGetEventsConfig(config: Partial<SdkConfig>): this {
    this.marketsGetEventsConfig = config;
    return this;
  }

  /**
   * Sets method-level configuration for marketsGetMarkets.
   * @param config - Partial configuration to override service-level defaults
   * @returns This service instance for method chaining
   */
  setMarketsGetMarketsConfig(config: Partial<SdkConfig>): this {
    this.marketsGetMarketsConfig = config;
    return this;
  }

  /**
 * List upcoming events.
**Errors** (with what a client or agent should do)

| Status | `error` | When | Recoverable | What to do |
|---|---|---|---|---|
| 400 | `missing_fields` | A required field is missing | yes | Fix the input: add the fields listed in `fields`, then retry. |
| 401 | `unauthorized` | Missing key, or another API's key | yes | Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. |
| 401 | `unresolved_reference` | A Passport reference skipped the proxy | yes | Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. |
 * @param {Partial<SdkConfig>} [requestConfig] - The request configuration for retry and validation.
 * @returns {Promise<HttpResponse<MarketsGetEventsOkResponse>>} - Success
 */
  async marketsGetEvents(requestConfig?: Partial<SdkConfig>): Promise<MarketsGetEventsOkResponse> {
    const resolvedConfig = this.getResolvedConfig(this.marketsGetEventsConfig, requestConfig);
    const request = new RequestBuilder()
      .setConfig(resolvedConfig)
      .setBaseUrl(resolvedConfig)
      .setMethod('GET')
      .setPath('/v1/events')
      .setRequestSchema(z.any())
      .addAccessTokenAuth(resolvedConfig?.token)
      .setRequestContentType(ContentType.Json)
      .addResponse({
        schema: marketsGetEventsOkResponseResponse,
        contentType: ContentType.Json,
        status: 200,
      })
      .addError({
        error: MarketsGetEventsBadRequestResponse,
        contentType: ContentType.Json,
        status: 400,
      })
      .addError({
        error: MarketsGetEventsUnauthorizedResponse,
        contentType: ContentType.Json,
        status: 401,
      })
      .addError({
        error: MarketsGetEventsInternalServerErrorResponse,
        contentType: ContentType.Json,
        status: 500,
      })
      .build();
    return this.client.callDirect<MarketsGetEventsOkResponse>(request);
  }

  /**
 * List markets with their outcomes and odds. Filter with `event_id`. American and decimal odds are both returned. Use `decimal_odds` for payout math (`payout = stake × decimal_odds`). An unknown `event_id` returns an empty list, not an error.
**Errors** (with what a client or agent should do)

| Status | `error` | When | Recoverable | What to do |
|---|---|---|---|---|
| 400 | `missing_fields` | A required field is missing | yes | Fix the input: add the fields listed in `fields`, then retry. |
| 401 | `unauthorized` | Missing key, or another API's key | yes | Re-authenticate: send this API's own key (as a Passport reference). Do not try other APIs' keys. |
| 401 | `unresolved_reference` | A Passport reference skipped the proxy | yes | Route the call through the Passport Secure Access Proxy (check `HTTPS_PROXY` and `passport whoami`), then retry. |
 * @param {string} [params.eventId] - Filter by event.
 * @param {Partial<SdkConfig>} [requestConfig] - The request configuration for retry and validation.
 * @returns {Promise<HttpResponse<MarketsGetMarketsOkResponse>>} - Success
 */
  async marketsGetMarkets(
    params?: MarketsGetMarketsParams,
    requestConfig?: Partial<SdkConfig>,
  ): Promise<MarketsGetMarketsOkResponse> {
    const resolvedConfig = this.getResolvedConfig(this.marketsGetMarketsConfig, requestConfig);
    z.object({ eventId: z.string().optional() }).parse(params ?? {});
    const request = new RequestBuilder()
      .setConfig(resolvedConfig)
      .setBaseUrl(resolvedConfig)
      .setMethod('GET')
      .setPath('/v1/markets')
      .setRequestSchema(z.any())
      .addAccessTokenAuth(resolvedConfig?.token)
      .setRequestContentType(ContentType.Json)
      .addResponse({
        schema: marketsGetMarketsOkResponseResponse,
        contentType: ContentType.Json,
        status: 200,
      })
      .addError({
        error: MarketsGetMarketsBadRequestResponse,
        contentType: ContentType.Json,
        status: 400,
      })
      .addError({
        error: MarketsGetMarketsUnauthorizedResponse,
        contentType: ContentType.Json,
        status: 401,
      })
      .addError({
        error: MarketsGetMarketsInternalServerErrorResponse,
        contentType: ContentType.Json,
        status: 500,
      })
      .addQueryParam({
        key: 'event_id',
        value: params?.eventId,
      })
      .build();
    return this.client.callDirect<MarketsGetMarketsOkResponse>(request);
  }
}
