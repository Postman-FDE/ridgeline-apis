import { config } from '../config.mjs';

export async function request(service, method, path, body) {
  const res = await fetch(`${config.baseUrl}/${service}${path}`, {
    method,
    headers: { authorization: `Bearer ${config.keys[service]}`, 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.message ?? `${service} ${res.status}`), { status: res.status, data });
  return data;
}
