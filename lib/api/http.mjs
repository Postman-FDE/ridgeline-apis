// Web-standard (Request -> Response) API core shared by the Next.js route handler and the scripts.
import { createHash, timingSafeEqual } from 'node:crypto';
import { keyFor, KEY_ENV } from './keys.mjs';
import { load, save } from './store.mjs';

export class HttpError extends Error {
  constructor(status, code, message, extra = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}

const json = (status, body) => new Response(JSON.stringify(body, null, 2), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

// Short, non-reversible fingerprint so logs identify a caller without logging the secret.
export const fingerprint = (token) => createHash('sha256').update(token).digest('hex').slice(0, 12);

const tokenMatches = (presented, expected) => {
  const a = Buffer.from(presented);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
};

export const required = (body, fields) => {
  const missing = fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === '');
  if (missing.length) throw new HttpError(400, 'missing_fields', `Missing required field(s): ${missing.join(', ')}.`, { fields: missing });
};

export const intMinor = (value, field) => {
  if (!Number.isInteger(value) || value <= 0) throw new HttpError(400, 'invalid_amount', `\`${field}\` must be a positive integer in minor units (cents). Example: 1000 = $10.00.`, { field });
};

/**
 * Handle one API call.
 * @param {Record<string, {routes: Array<{method:string, path:string, mutates?:boolean, handler:Function}>}>} services
 * @param {string} service  first path segment, e.g. "bets"
 * @param {string} path     the rest, e.g. "/v1/bets" (exact match: Passport matches method + host + path)
 * @param {Request} request
 */
export async function dispatch(services, service, path, request) {
  const started = Date.now();
  let status = 500;
  let caller = 'anonymous';
  try {
    const svc = services[service];
    if (!svc) throw new HttpError(404, 'not_found', `Unknown API "/${service}". Available: ${Object.keys(services).join(', ')}.`);
    const route = svc.routes.find((r) => r.method === request.method && r.path === path);
    if (!route) throw new HttpError(404, 'not_found', `No route ${request.method} ${path} on ${service}.`);

    const expected = keyFor(service);
    if (!expected) throw new HttpError(503, 'not_configured', `${KEY_ENV[service]} is not set on the server.`);
    const auth = request.headers.get('authorization') || '';
    const presented = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    if (presented.includes('{{vault:')) {
      // A Passport reference arrived unresolved: the call skipped the Secure Access Proxy.
      throw new HttpError(401, 'unresolved_reference', 'Received an unresolved Passport reference. Route this call through the Passport Secure Access Proxy.');
    }
    if (!presented || !tokenMatches(presented, expected)) throw new HttpError(401, 'unauthorized', `Missing or invalid bearer key for ${service}.`);
    caller = fingerprint(presented);

    let body = {};
    if (request.method !== 'GET') {
      const raw = await request.text();
      try {
        body = raw ? JSON.parse(raw) : {};
      } catch {
        throw new HttpError(400, 'invalid_json', 'Request body must be valid JSON.');
      }
    }
    const query = Object.fromEntries(new URL(request.url).searchParams);
    const state = await load();
    const result = await route.handler({ body, query, state });
    if (route.mutates) await save(state);

    // Handlers return a plain body, or an envelope { status: <int>, body }.
    const envelope = result && Number.isInteger(result.status) && 'body' in result;
    status = envelope ? result.status : 200;
    return json(status, envelope ? result.body : result);
  } catch (err) {
    if (err instanceof HttpError) {
      status = err.status;
      return json(err.status, { error: err.code, message: err.message, ...err.extra });
    }
    console.error(err);
    status = 500;
    return json(500, { error: 'internal', message: 'Unexpected error.' });
  } finally {
    // One structured line per call: what the API owner sees (compare with the Passport audit log).
    console.log(JSON.stringify({ ts: new Date().toISOString(), service, method: request.method, path, status, caller, ms: Date.now() - started }));
  }
}
