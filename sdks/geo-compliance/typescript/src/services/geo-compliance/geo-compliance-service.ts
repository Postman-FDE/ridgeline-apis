import { z } from 'zod';
import { BaseService } from '../base-service';
import { ContentType, HttpResponse, SdkConfig } from '../../http/types';
import { RequestBuilder } from '../../http/transport/request-builder';
import { SerializationStyle } from '../../http/serialization/base-serializer';
import { ThrowableError } from '../../http/errors/throwable-error';
import { Environment } from '../../http/environment';
import {
  GeoCompliancePostLocationCheckRequest,
  geoCompliancePostLocationCheckRequestRequest,
} from './models/geo-compliance-post-location-check-request';
import { GeoCompliancePostLocationCheckBadRequestResponse } from './models/geo-compliance-post-location-check-bad-request-response';
import { GeoCompliancePostLocationCheckUnauthorizedResponse } from './models/geo-compliance-post-location-check-unauthorized-response';
import { GeoCompliancePostLocationCheckNotFoundResponse } from './models/geo-compliance-post-location-check-not-found-response';
import { GeoCompliancePostLocationCheckInternalServerErrorResponse } from './models/geo-compliance-post-location-check-internal-server-error-response';

/**
 * Service class for GeoComplianceService operations.
 * Provides methods to interact with GeoComplianceService-related API endpoints.
 * All methods return promises and handle request/response serialization automatically.
 */
export class GeoComplianceService extends BaseService {
  protected geoCompliancePostLocationCheckConfig?: Partial<SdkConfig>;

  /**
   * Sets method-level configuration for geoCompliancePostLocationCheck.
   * @param config - Partial configuration to override service-level defaults
   * @returns This service instance for method chaining
   */
  setGeoCompliancePostLocationCheckConfig(config: Partial<SdkConfig>): this {
    this.geoCompliancePostLocationCheckConfig = config;
    return this;
  }

  /**
 * Check whether `product` is available where the player is located. `reason` is `PRODUCT_NOT_AVAILABLE_IN_STATE` when it is not.
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
  async geoCompliancePostLocationCheck(
    body: GeoCompliancePostLocationCheckRequest,
    requestConfig?: Partial<SdkConfig>,
  ): Promise<any> {
    const resolvedConfig = this.getResolvedConfig(
      this.geoCompliancePostLocationCheckConfig,
      requestConfig,
    );
    const request = new RequestBuilder()
      .setConfig(resolvedConfig)
      .setBaseUrl(resolvedConfig)
      .setMethod('POST')
      .setPath('/v1/location/check')
      .setRequestSchema(geoCompliancePostLocationCheckRequestRequest)
      .addAccessTokenAuth(resolvedConfig?.token)
      .setRequestContentType(ContentType.Json)
      .addResponse({
        schema: z.any(),
        contentType: ContentType.Json,
        status: 200,
      })
      .addError({
        error: GeoCompliancePostLocationCheckBadRequestResponse,
        contentType: ContentType.Json,
        status: 400,
      })
      .addError({
        error: GeoCompliancePostLocationCheckUnauthorizedResponse,
        contentType: ContentType.Json,
        status: 401,
      })
      .addError({
        error: GeoCompliancePostLocationCheckNotFoundResponse,
        contentType: ContentType.Json,
        status: 404,
      })
      .addError({
        error: GeoCompliancePostLocationCheckInternalServerErrorResponse,
        contentType: ContentType.Json,
        status: 500,
      })
      .addHeaderParam({ key: 'Content-Type', value: 'application/json' })
      .addBody(body)
      .build();
    return this.client.callDirect<any>(request);
  }
}
