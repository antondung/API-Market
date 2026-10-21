import type { Pool } from 'pg';
import { z } from 'zod';
import { ApiError } from './auth.js';

export const marketplaceId = z.string().regex(/^[1-9][0-9]{0,9}$/).refine(value => Number(value) <= 2147483647);
const searchText = (max: number) => z.string().trim().min(1).max(max).refine(value => !value.includes('\0'), 'NUL characters are not supported');
export const marketplaceQuery = z.object({
  q: searchText(200).optional(),
  category: searchText(100).optional(),
  tag: searchText(100).optional(),
  providerId: marketplaceId.optional(),
  pricing: z.enum(['free', 'paid']).optional(),
  sort: z.enum(['newest', 'name']).default('newest'),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
}).strict();
type Query = z.infer<typeof marketplaceQuery>;

// Public projections are explicit: never serialize Provider/User rows or internal review records.
const projection = `a.id::text AS id, a.name, a.description, a.category, a.tags,
  a.published_at AS "publishedAt", p.id::text AS "providerId", p.provider_name AS "providerName",
  COALESCE((SELECT pv.status FROM provider_verifications pv WHERE pv.provider_id=p.id ORDER BY pv.id DESC LIMIT 1), 'Pending') AS "providerStatus",
  EXISTS(SELECT 1 FROM api_plans pl WHERE pl.api_id=a.id AND pl.is_active AND pl.price_monthly=0) AS "hasFreePlan",
  EXISTS(SELECT 1 FROM api_plans pl WHERE pl.api_id=a.id AND pl.is_active AND pl.price_monthly>0) AS "hasPaidPlan"`;
const source = `FROM apis a JOIN api_providers p ON p.id=a.provider_id JOIN users u ON u.id=p.user_id`;
const visible = `a.status='Published' AND u.is_active=true`;

export class MarketplaceService {
  constructor(readonly pool: Pool) {}

  async list(query: Query) {
    const values: unknown[] = [];
    const clauses = [visible];
    const bind = (value: unknown) => { values.push(value); return `$${values.length}`; };
    if (query.q) {
      const param = bind(query.q);
      clauses.push(`(strpos(lower(a.name),lower(${param}))>0 OR strpos(lower(a.description),lower(${param}))>0)`);
    }
    if (query.category) clauses.push(`a.category=${bind(query.category)}`);
    if (query.tag) clauses.push(`a.tags @> ${bind(JSON.stringify([query.tag]))}::jsonb`);
    if (query.providerId) clauses.push(`a.provider_id=${bind(query.providerId)}`);
    if (query.pricing) clauses.push(`EXISTS(SELECT 1 FROM api_plans pl WHERE pl.api_id=a.id AND pl.is_active AND pl.price_monthly${query.pricing === 'free' ? '=0' : '>0'})`);
    const where = clauses.join(' AND ');
    const client = await this.pool.connect();
    try {
      // Count and page must describe the same snapshot, including an empty page beyond the end.
      await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
      const total = Number((await client.query(`SELECT COUNT(*) ${source} WHERE ${where}`, values)).rows[0].count);
      const order = query.sort === 'name' ? 'lower(a.name) ASC, a.id ASC' : 'a.published_at DESC NULLS LAST, a.id DESC';
      const limit = bind(query.pageSize), offset = bind((query.page - 1) * query.pageSize);
      const items = (await client.query(`SELECT ${projection} ${source} WHERE ${where} ORDER BY ${order} LIMIT ${limit} OFFSET ${offset}`, values)).rows;
      await client.query('COMMIT');
      return { items, total, page: query.page, pageSize: query.pageSize };
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
  }

  async detail(id: string) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
      const api = (await client.query(`SELECT ${projection} ${source} WHERE ${visible} AND a.id=$1`, [id])).rows[0];
      if (!api) throw new ApiError(404, 'NOT_FOUND', 'API not found');
      const versions = (await client.query(`SELECT id::text, version, changelog FROM api_versions WHERE api_id=$1 ORDER BY id DESC`, [id])).rows;
      const endpoints = (await client.query(`SELECT id::text, version_id::text AS "versionId", method, path, description, parameters,
        request_schema AS "requestSchema", response_example AS "responseExample" FROM api_endpoints WHERE api_id=$1 ORDER BY version_id DESC, path, method, id`, [id])).rows;
      const documentation = (await client.query(`SELECT version_id::text AS "versionId", source, content FROM api_documentations WHERE api_id=$1 ORDER BY version_id DESC`, [id])).rows;
      const plans = (await client.query(`SELECT id::text, name, price_monthly::float8 AS "priceMonthly", currency, quota::float8, rate_limit AS "rateLimit"
        FROM api_plans WHERE api_id=$1 AND is_active ORDER BY price_monthly, id`, [id])).rows;
      const legal = (await client.query(`SELECT data_classification AS "dataClassification", processes_personal_data AS "processesPersonalData",
        personal_data_types AS "personalDataTypes", data_processing_purpose AS "dataProcessingPurpose"
        FROM api_legal_declarations WHERE api_id=$1`, [id])).rows[0] ?? null;
      await client.query('COMMIT');
      return { ...api, versions, endpoints, documentation, plans, legal };
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
  }
}
