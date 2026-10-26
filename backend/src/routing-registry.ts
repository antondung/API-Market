import type { Pool } from 'pg';
import { ApiError } from './auth.js';
import { marketplaceId } from './marketplace-service.js';

/** Internal Gateway contract. Never expose upstream URLs through a public registry endpoint. */
export class RoutingRegistry {
  constructor(readonly pool: Pool) {}
  async resolve(apiId: string): Promise<{ id: string; apiId: string; upstreamBaseUrl: string; timeoutMs: number }> {
    if (!marketplaceId.safeParse(apiId).success) throw new ApiError(404, 'NOT_FOUND', 'API route not found');
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      // Backfill only missing routes. A disabled/customized route is an explicit operator decision.
      await client.query(`INSERT INTO gateway_routes(api_id,upstream_base_url)
        SELECT a.id,a.base_url FROM apis a JOIN api_providers p ON p.id=a.provider_id JOIN users u ON u.id=p.user_id
        WHERE a.id=$1 AND a.status='Published' AND u.is_active ON CONFLICT(api_id) DO NOTHING`, [apiId]);
      const result = (await client.query(`SELECT r.id::text,r.api_id::text AS "apiId",r.upstream_base_url AS "upstreamBaseUrl",
        LEAST(r.timeout_ms,10000) AS "timeoutMs" FROM gateway_routes r JOIN apis a ON a.id=r.api_id
        JOIN api_providers p ON p.id=a.provider_id JOIN users u ON u.id=p.user_id
        WHERE r.api_id=$1 AND r.is_enabled AND a.status='Published' AND u.is_active`, [apiId])).rows[0];
      if (!result) throw new ApiError(404, 'NOT_FOUND', 'API route not found');
      await client.query('COMMIT');
      return result;
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
  }
}
