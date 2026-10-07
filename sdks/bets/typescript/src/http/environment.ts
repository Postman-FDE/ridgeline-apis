/**
 * Available API environments with their base URLs.
 * Use these constants to configure the SDK for different environments (production, staging, etc.).
 */
export enum Environment {
  /** DEFAULT environment base URL */
  DEFAULT = 'https://{host}/bets',
  /** HOSTED_SANDBOX_ROUTE_THROUGH_PASSPORT environment base URL */
  HOSTED_SANDBOX_ROUTE_THROUGH_PASSPORT = 'https://{host}/bets',
  /** LOCAL_NEXT_DEV environment base URL */
  LOCAL_NEXT_DEV = 'http://localhost:4100/bets',
}
