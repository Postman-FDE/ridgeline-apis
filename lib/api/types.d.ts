declare module '@/lib/api/http.mjs' {
  export function dispatch(services: Record<string, unknown>, service: string, path: string, request: Request): Promise<Response>;
}
declare module '@/lib/api/services/index.mjs' {
  export const services: Record<string, unknown>;
}
declare module '@/lib/api/store.mjs' {
  export function storeMode(): 'redis' | 'memory';
}
declare module '@/lib/catalog.mjs' {
  type Endpoint = { method: string; path: string; summary: string };
  export const services: { name: string; title: string; owner: string; secretRef: string; description: string; version?: string; endpoints: Endpoint[] }[];
}
