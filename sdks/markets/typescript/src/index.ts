import { Environment } from './http/environment';
import { SdkConfig } from './http/types';
import { MarketsService } from './services/markets';

export * from './services/markets';

export * from './http';
export { Environment } from './http/environment';

export class RidgelineMarkets {
  public readonly markets: MarketsService;

  constructor(public config: SdkConfig = {}) {
    this.markets = new MarketsService(this.config);
  }

  set baseUrl(baseUrl: string) {
    this.markets.baseUrl = baseUrl;
  }

  set environment(environment: Environment) {
    this.markets.baseUrl = environment;
  }

  set timeoutMs(timeoutMs: number) {
    this.markets.timeoutMs = timeoutMs;
  }

  set token(token: string) {
    this.markets.token = token;
  }

  set host(host: string) {
    this.markets.host = host;
  }
}

// c029837e0e474b76bc487506e8799df5e3335891efe4fb02bda7a1441840310c
