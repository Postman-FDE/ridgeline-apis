// State store. Serverless instances don't share memory, so on Vercel set a Redis REST store:
//   Upstash for Redis / Vercel KV marketplace integration -> KV_REST_API_URL + KV_REST_API_TOKEN
//   (or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN)
// Without one, state lives in process memory (fine locally; may reset between calls on Vercel).
import { seed } from './seed.mjs';

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = process.env.STATE_KEY || 'api-sandbox:state:v1';

let memory = null;

const redis = async (command) => {
  const res = await fetch(url, { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify(command), cache: 'no-store' });
  if (!res.ok) throw new Error(`state store ${res.status}`);
  return (await res.json()).result;
};

export const storeMode = () => (url && token ? 'redis' : 'memory');

export async function load() {
  if (storeMode() === 'memory') return (memory ??= seed());
  const raw = await redis(['GET', KEY]);
  return raw ? JSON.parse(raw) : seed();
}

export async function save(state) {
  if (storeMode() === 'memory') {
    memory = state;
    return;
  }
  await redis(['SET', KEY, JSON.stringify(state)]);
}

export async function reset() {
  const fresh = seed();
  await save(fresh);
  return fresh;
}

export const nextId = (state, prefix) => `${prefix}-${String(++state.seq).padStart(5, '0')}`;
