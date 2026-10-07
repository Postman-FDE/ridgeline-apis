import { request } from './http.mjs';

export const listMarkets = (eventId) => request('markets', 'GET', `/v1/markets?event_id=${encodeURIComponent(eventId)}`).then((r) => r.markets);
