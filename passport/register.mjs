// Register the Ridgeline Sandbox secret references and endpoints in a Passport namespace via the public API.
// DRY RUN by default: prints what it would send. Add --apply to call the API.
//
//   PASSPORT_ADMIN_KEY=sk_...          admin API key (passport:admin scope)
//   PASSPORT_NAMESPACE_ID=...          the "Ridgeline Sandbox" namespace (create it in the UI first)
//   SANDBOX_HOST=your-project.vercel.app (defaults to endpoints.json host)
//   PASSPORT_VAULT_TYPE=hashicorp      hashicorp | aws | gcp (check the exact enum in your tenant)
//   SANDBOX_VAULT_PREFIX=ridgeline      must match passport/vault-seed.sh
//
// Request shapes follow docs.usepassport.ai/openapi.yaml (secret-references, endpoints). Field enums
// like vaultType/status aren't confirmed for every tenant. If a call 400s, register the same rows in the UI
// (Namespace > Vault > Create vault reference; Add resources > API spec using specs/*.openapi.json).
import { readFileSync } from 'node:fs';

const apply = process.argv.includes('--apply');
const api = process.env.PASSPORT_API_URL ?? 'https://api.usepassport.ai/public/v1';
const map = JSON.parse(readFileSync(new URL('./endpoints.json', import.meta.url)));
const ns = process.env.PASSPORT_NAMESPACE_ID ?? '<NAMESPACE_ID>';
const host = (process.env.SANDBOX_HOST ?? map.host).toLowerCase();
const vaultType = process.env.PASSPORT_VAULT_TYPE ?? 'hashicorp';
const prefix = process.env.SANDBOX_VAULT_PREFIX ?? 'ridgeline';

const send = async (method, path, body) => {
  if (!apply) {
    console.log(`DRY  ${method} ${api}${path}\n     ${JSON.stringify(body)}`);
    return { id: `<id-of-${body.name ?? body.path}>` };
  }
  const res = await fetch(`${api}${path}`, {
    method,
    headers: { authorization: `Bearer ${process.env.PASSPORT_ADMIN_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${JSON.stringify(data)}`);
  console.log(`OK   ${method} ${path}`);
  return data;
};

if (apply && !process.env.PASSPORT_ADMIN_KEY) throw new Error('Set PASSPORT_ADMIN_KEY.');

// 1. One secret reference per service key.
const refs = {};
for (const ref of [...new Set(map.endpoints.map((e) => e.secret_reference))]) {
  const svc = map.endpoints.find((e) => e.secret_reference === ref).path.split('/')[1];
  const created = await send('POST', `/namespaces/${ns}/secret-references`, {
    name: ref,
    vaultType,
    vaultKey: `${prefix}/${svc}`,
    metadata: { owner: map.endpoints.find((e) => e.secret_reference === ref).owner, demo: 'ridgeline-sandbox' },
  });
  refs[ref] = created.id;
}

// 2. One endpoint per method + host + path, its Authorization slot bound to the service's reference.
for (const ep of map.endpoints) {
  await send('POST', `/namespaces/${ns}/endpoints`, {
    method: ep.method,
    host,
    path: ep.path,
    status: 'active',
    secrets: [{ label: ep.secret_label, secretReferenceId: refs[ep.secret_reference] }],
  });
}
console.log(apply ? '\nRegistered. Next: group endpoints into resource groups per service in the UI.' : '\nDry run only. Re-run with --apply.');
