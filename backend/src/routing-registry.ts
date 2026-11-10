import type { Pool } from 'pg';
import { ApiError } from './auth.js';
import { marketplaceId } from './marketplace-service.js';

/** Internal Gateway contract. Never expose upstream URLs through a public registry endpoint. */
export class RoutingRegistry {
  constructor(readonly pool: Pool) {}
  async resolve(apiId: string): Promise<{ id: string; apiId: string; upstreamBaseUrl: string; timeoutMs: number }> {
    if (!marketplaceId.safeParse(apiId).success) throw new ApiError(404, 'NOT_FOUND', 'API route not found');
    const find = async () => (await this.pool.query(
      `SELECT r.id::text,r.api_id::text AS "apiId",r.upstream_base_url AS "upstreamBaseUrl",
         LEAST(r.timeout_ms,10000) AS "timeoutMs", r.is_enabled
       FROM gateway_routes r JOIN apis a ON a.id=r.api_id
       JOIN api_providers p ON p.id=a.provider_id JOIN users u ON u.id=p.user_id
       WHERE r.api_id=$1 AND a.status='Published' AND u.is_active`, [apiId],
    )).rows[0];
    let result = await find();
    if (!result) {
      // The unique api_id constraint resolves concurrent first requests.
      await this.pool.query(`INSERT INTO gateway_routes(api_id,upstream_base_url)
        SELECT a.id,a.base_url FROM apis a JOIN api_providers p ON p.id=a.provider_id JOIN users u ON u.id=p.user_id
        WHERE a.id=$1 AND a.status='Published' AND u.is_active ON CONFLICT(api_id) DO NOTHING`, [apiId]);
      // Re-read even after a conflicting insert, preserving the operator's route decision.
      result = await find();
    }
    if (!result?.is_enabled) throw new ApiError(404, 'NOT_FOUND', 'API route not found');
    const { id, apiId: resolvedApiId, upstreamBaseUrl, timeoutMs } = result;
    return { id, apiId: resolvedApiId, upstreamBaseUrl, timeoutMs };
  }
}
