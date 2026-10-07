import { Environment } from './http/environment';
import { SdkConfig } from './http/types';
import { GeoComplianceService } from './services/geo-compliance';

export * from './services/geo-compliance';

export * from './http';
export { Environment } from './http/environment';

export class RidgelineGeoCompliance {
  public readonly geoCompliance: GeoComplianceService;

  constructor(public config: SdkConfig = {}) {
    this.geoCompliance = new GeoComplianceService(this.config);
  }

  set baseUrl(baseUrl: string) {
    this.geoCompliance.baseUrl = baseUrl;
  }

  set environment(environment: Environment) {
    this.geoCompliance.baseUrl = environment;
  }

  set timeoutMs(timeoutMs: number) {
    this.geoCompliance.timeoutMs = timeoutMs;
  }

  set token(token: string) {
    this.geoCompliance.token = token;
  }

  set host(host: string) {
    this.geoCompliance.host = host;
  }
}

// c029837e0e474b76bc487506e8799df5e3335891efe4fb02bda7a1441840310c
