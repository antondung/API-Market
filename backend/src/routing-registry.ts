import type { Pool } from 'pg';
import { ApiError } from './auth.js';
import { marketplaceId } from './marketplace-service.js';

type Route = { id: string; apiId: string; upstreamBaseUrl: string; timeoutMs: number };
type RegisteredRoute = Route & { is_enabled: boolean };
type RegisteredEndpoint = { id: string; path: string };

/** Internal Gateway contract. Never expose upstream URLs through a public registry endpoint. */
export class RoutingRegistry {
  constructor(readonly pool: Pool) {}
  async lookup(apiId: string, method?: string): Promise<{ route: RegisteredRoute | null; endpoints: RegisteredEndpoint[] }> {
    if (!marketplaceId.safeParse(apiId).success) throw new ApiError(404, 'NOT_FOUND', 'API route not found');
    const result = (await this.pool.query<{ route: RegisteredRoute | null; endpoints: RegisteredEndpoint[] }>({
      name: 'gateway-route-and-endpoints',
      text: `SELECT CASE WHEN r.id IS NOT NULL THEN jsonb_build_object(
         'id',r.id::text,'apiId',r.api_id::text,'upstreamBaseUrl',r.upstream_base_url,
         'timeoutMs',LEAST(r.timeout_ms,10000),'is_enabled',r.is_enabled) END AS route,
         COALESCE((SELECT jsonb_agg(jsonb_build_object('id',e.id::text,'path',e.path) ORDER BY e.id)
           FROM api_endpoints e JOIN api_versions v ON v.id=e.version_id
           WHERE e.api_id=a.id AND v.api_id=a.id AND e.method=$2), '[]'::jsonb) AS endpoints
       FROM apis a LEFT JOIN gateway_routes r ON r.api_id=a.id
       JOIN api_providers p ON p.id=a.provider_id JOIN users u ON u.id=p.user_id
       WHERE a.id=$1 AND a.status='Published' AND u.is_active`,
      values: [apiId, method ?? null],
    })).rows[0];
    return result ?? { route: null, endpoints: [] };
  }

  async resolve(apiId: string, registeredRoute?: RegisteredRoute | null): Promise<Route> {
    let result = registeredRoute === undefined ? (await this.lookup(apiId)).route : registeredRoute;
    if (!result) {
      // The unique api_id constraint resolves concurrent first requests.
      await this.pool.query(`INSERT INTO gateway_routes(api_id,upstream_base_url)
        SELECT a.id,a.base_url FROM apis a JOIN api_providers p ON p.id=a.provider_id JOIN users u ON u.id=p.user_id
        WHERE a.id=$1 AND a.status='Published' AND u.is_active ON CONFLICT(api_id) DO NOTHING`, [apiId]);
      // Re-read even after a conflicting insert, preserving the operator's route decision.
      result = (await this.lookup(apiId)).route;
    }
    if (!result?.is_enabled) throw new ApiError(404, 'NOT_FOUND', 'API route not found');
    const { id, apiId: resolvedApiId, upstreamBaseUrl, timeoutMs } = result;
    return { id, apiId: resolvedApiId, upstreamBaseUrl, timeoutMs };
  }
}
