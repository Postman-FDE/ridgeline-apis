/**
 * Ridgeline boost-ops: Astropods entrypoint.
 *
 * Environment (injected by Astropods):
 *   ANTHROPIC_API_KEY                 anthropic model (may itself be a Passport reference)
 *   RIDGELINE_BASE_URL, RIDGELINE_*_KEY   custom `ridgeline` provider; keys are Passport references
 *   PASSPORT_PROXY_URL                optional, routes calls through the Passport Secure Access Proxy
 *   GRPC_SERVER_ADDR                  Astropods messaging sidecar
 */
import { serve } from '@astropods/adapter-mastra';
import { agent } from './agent';

serve(agent);
