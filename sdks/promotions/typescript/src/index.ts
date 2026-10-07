import { Environment } from './http/environment';
import { SdkConfig } from './http/types';
import { PromotionsService } from './services/promotions';

export * from './services/promotions';

export * from './http';
export { Environment } from './http/environment';

export class RidgelinePromotions {
  public readonly promotions: PromotionsService;

  constructor(public config: SdkConfig = {}) {
    this.promotions = new PromotionsService(this.config);
  }

  set baseUrl(baseUrl: string) {
    this.promotions.baseUrl = baseUrl;
  }

  set environment(environment: Environment) {
    this.promotions.baseUrl = environment;
  }

  set timeoutMs(timeoutMs: number) {
    this.promotions.timeoutMs = timeoutMs;
  }

  set token(token: string) {
    this.promotions.token = token;
  }

  set host(host: string) {
    this.promotions.host = host;
  }
}

// c029837e0e474b76bc487506e8799df5e3335891efe4fb02bda7a1441840310c
