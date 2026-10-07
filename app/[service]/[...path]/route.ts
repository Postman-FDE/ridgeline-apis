// Every API is served from /<service>/v1/... with exact path matching (Passport grants match
// method + host + path exactly). All logic lives in lib/api so scripts can run it in-process.
import { dispatch } from '@/lib/api/http.mjs';
import { services } from '@/lib/api/services/index.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ service: string; path: string[] }> };

const handle = async (request: Request, { params }: Ctx) => {
  const { service, path } = await params;
  return dispatch(services, service, '/' + path.join('/'), request);
};

export const GET = handle;
export const POST = handle;
