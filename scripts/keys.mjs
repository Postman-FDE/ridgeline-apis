// Print a fresh set of defined bearer keys in .env format:  npm run keys > .env.local
import { randomBytes } from 'node:crypto';
import { KEY_ENV } from '../lib/api/keys.mjs';

for (const [service, env] of Object.entries(KEY_ENV)) {
  console.log(`${env}=sk_sandbox_${service.replace(/-/g, '')}_${randomBytes(16).toString('hex')}`);
}
