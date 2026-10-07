import { Environment } from './http/environment';
import { SdkConfig } from './http/types';
import { BetsService } from './services/bets';

export * from './services/bets';

export * from './http';
export { Environment } from './http/environment';

export class RidgelineBets {
  public readonly bets: BetsService;

  constructor(public config: SdkConfig = {}) {
    this.bets = new BetsService(this.config);
  }

  set baseUrl(baseUrl: string) {
    this.bets.baseUrl = baseUrl;
  }

  set environment(environment: Environment) {
    this.bets.baseUrl = environment;
  }

  set timeoutMs(timeoutMs: number) {
    this.bets.timeoutMs = timeoutMs;
  }

  set token(token: string) {
    this.bets.token = token;
  }

  set host(host: string) {
    this.bets.host = host;
  }
}

// c029837e0e474b76bc487506e8799df5e3335891efe4fb02bda7a1441840310c
