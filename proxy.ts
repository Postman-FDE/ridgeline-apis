import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Gateway mode: the host serves the APIs and nothing else, like a real API gateway. The docs page, the specs
// and the collections answer 404, so an agent pointed at SANDBOX_BASE_URL can't discover the APIs from the
// host itself and has to get that context somewhere else (in the demo: the Postman workspace).
//   Local:  RIDGELINE_GATEWAY=1 npm run dev     (npm run local -- --gateway)
//   Vercel: any hostname starting with "api." (alias api.<your-domain> to the same deployment)
export function proxy(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  if (process.env.RIDGELINE_GATEWAY !== '1' && !host.startsWith('api.')) return NextResponse.next();
  return NextResponse.json(
    { error: 'not_found', message: 'No route matches this request.' },
    { status: 404, headers: { 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } },
  );
}

export const config = {
  matcher: ['/', '/specs/:path*', '/postman/:path*', '/openapi.json', '/docs/:path*'],
};
