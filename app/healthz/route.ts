import { storeMode } from '@/lib/api/store.mjs';

export const dynamic = 'force-dynamic';

export const GET = () => Response.json({ ok: true, store: storeMode() }, { headers: { 'cache-control': 'no-store' } });
