import type { Pool } from 'pg';
import { z } from 'zod';
import { ApiError } from './auth.js';
import { marketplaceId } from './marketplace-service.js';
import { SandboxService } from './consumer-service.js';
import { RoutingRegistry } from './routing-registry.js';
import { SafeProxy } from './safe-proxy.js';

const dictionary = (limit: number, length: number) => z.record(z.string().min(1).max(100), z.string().max(length)).refine(value => Object.keys(value).length <= limit);
export const playgroundInput = z.object({ endpointId: marketplaceId,
  pathParams: dictionary(20, 500).optional(), query: dictionary(30, 2000).optional(),
  headers: dictionary(3, 1000).optional(), body: z.unknown().optional() }).strict();
export type PlaygroundInput = z.infer<typeof playgroundInput>;

export class PlaygroundService {
  constructor(readonly pool: Pool, readonly sandbox = new SandboxService(pool), readonly registry = new RoutingRegistry(pool), readonly proxy = new SafeProxy()) {}
  async run(userId: string, apiId: string, input: PlaygroundInput) {
    const route = await this.registry.resolve(apiId);
    const endpoint = (await this.pool.query('SELECT method,path FROM api_endpoints WHERE api_id=$1 AND id=$2', [apiId, input.endpointId])).rows[0];
    if (!endpoint) throw new ApiError(400, 'ENDPOINT_NOT_REGISTERED', 'Endpoint is not registered for this API');
    // Validate destination and payload before spending quota. Never accept a URL/method from the client.
    const target = await this.proxy.prepare(route.upstreamBaseUrl, endpoint.path, { ...input, method: endpoint.method }, route.timeoutMs);
    const grant = await this.sandbox.consume(userId, apiId);
    // Failed upstream attempts consume their reserved request, preventing unlimited timeout retries.
    const response = await this.proxy.execute(target);
    return { ...response, remainingRequests: grant.remainingRequests };
  }
}
