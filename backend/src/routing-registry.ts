import { randomBytes } from 'node:crypto';
import type { Pool } from 'pg';
import { ApiError } from './auth.js';
import { marketplaceId } from './marketplace-service.js';
import { openUpstreamSecret, sealUpstreamSecret } from './upstream-hmac.js';

export interface ResolvedRoute {
  id: string;
  apiId: string;
  upstreamBaseUrl: string;
  timeoutMs: number;
  upstreamSecret: string;
}

function defaultSigningKey() {
  const configured = process.env.UPSTREAM_SIGNING_KEY?.trim();
  if (process.env.NODE_ENV === 'production') {
    if (!configured || Buffer.byteLength(configured) < 32) throw new Error('UPSTREAM_SIGNING_KEY is required in production');
    return configured;
  }
  return configured || process.env.JWT_SECRET || 'development-upstream-signing-key-32b';
}

/** Internal Gateway contract. Never expose upstream URLs or secrets through a public registry endpoint. */
export class RoutingRegistry {
  private readonly signingKey: string;
  constructor(readonly pool: Pool, signingKey?: string, private readonly bootstrapSecret?: string) {
    this.signingKey = signingKey ?? defaultSigningKey();
    if (Buffer.byteLength(this.signingKey) < 32) throw new Error('Upstream signing key must have at least 32 bytes');
    if (bootstrapSecret !== undefined && Buffer.byteLength(bootstrapSecret) < 32) throw new Error('UPSTREAM_HMAC_SECRET must have at least 32 bytes');
  }

  async resolve(apiId: string): Promise<ResolvedRoute> {
    if (!marketplaceId.safeParse(apiId).success) throw new ApiError(404, 'NOT_FOUND', 'API route not found');
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`INSERT INTO gateway_routes(api_id,upstream_base_url)
        SELECT a.id,a.base_url FROM apis a JOIN api_providers p ON p.id=a.provider_id JOIN users u ON u.id=p.user_id
        WHERE a.id=$1 AND a.status='Published' AND u.is_active ON CONFLICT(api_id) DO NOTHING`, [apiId]);
      const result = (await client.query(`SELECT r.id::text,r.api_id::text AS "apiId",r.upstream_base_url AS "upstreamBaseUrl",
        LEAST(r.timeout_ms,10000) AS "timeoutMs", r.upstream_secret_enc AS enc
        FROM gateway_routes r JOIN apis a ON a.id=r.api_id
        JOIN api_providers p ON p.id=a.provider_id JOIN users u ON u.id=p.user_id
        WHERE r.api_id=$1 AND r.is_enabled AND a.status='Published' AND u.is_active`, [apiId])).rows[0];
      if (!result) throw new ApiError(404, 'NOT_FOUND', 'API route not found');
      const upstreamSecret = await this.secret(client, result.id, result.enc);
      await client.query('COMMIT');
      return { id: result.id, apiId: result.apiId, upstreamBaseUrl: result.upstreamBaseUrl, timeoutMs: result.timeoutMs, upstreamSecret };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async secret(client: { query: Pool['query'] }, routeId: string, current: string | null) {
    if (current) return this.open(current);
    const plaintext = this.bootstrapSecret ?? randomBytes(32).toString('hex');
    const sealed = sealUpstreamSecret(this.signingKey, plaintext);
    const saved = await client.query(
      'UPDATE gateway_routes SET upstream_secret_enc=$2 WHERE id=$1 AND upstream_secret_enc IS NULL RETURNING upstream_secret_enc',
      [routeId, sealed],
    );
    if (saved.rowCount) return plaintext;
    const again = (await client.query('SELECT upstream_secret_enc FROM gateway_routes WHERE id=$1', [routeId])).rows[0];
    return this.open(again?.upstream_secret_enc);
  }

  private open(sealed: string | null) {
    try {
      if (!sealed) throw new Error('missing');
      return openUpstreamSecret(this.signingKey, sealed);
    } catch {
      throw new ApiError(503, 'UPSTREAM_SIGNING_UNAVAILABLE', 'Upstream signing is unavailable');
    }
  }
}
