import { Environment } from './http/environment';
import { SdkConfig } from './http/types';
import { PlayerLimitsService } from './services/player-limits';

export * from './services/player-limits';

export * from './http';
export { Environment } from './http/environment';

export class RidgelinePlayerLimits {
  public readonly playerLimits: PlayerLimitsService;

  constructor(public config: SdkConfig = {}) {
    this.playerLimits = new PlayerLimitsService(this.config);
  }

  set baseUrl(baseUrl: string) {
    this.playerLimits.baseUrl = baseUrl;
  }

  set environment(environment: Environment) {
    this.playerLimits.baseUrl = environment;
  }

  set timeoutMs(timeoutMs: number) {
    this.playerLimits.timeoutMs = timeoutMs;
  }

  set token(token: string) {
    this.playerLimits.token = token;
  }

  set host(host: string) {
    this.playerLimits.host = host;
  }
}

// c029837e0e474b76bc487506e8799df5e3335891efe4fb02bda7a1441840310c
