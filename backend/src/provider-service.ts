import type { Pool, PoolClient } from 'pg';
import { ApiError } from './auth.js';
import { requireDraft, requireVerified, submitApi, transitionApi } from './provider-domain.js';
import type { ApiState, VerificationState } from './provider-domain.js';
import { importOpenApi } from './provider-openapi-import.js';

export const idPattern = /^[1-9][0-9]{0,9}$/;
function id(value: string) {
  if (!idPattern.test(value) || Number(value) > 2147483647) throw new ApiError(404, 'NOT_FOUND', 'Resource not found');
  return value;
}
const missing = () => new ApiError(404, 'NOT_FOUND', 'Resource not found');
const row = (r: Record<string, any>) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
  v instanceof Date ? v.toISOString() : (/^id$|_id$/.test(k) || k === 'reviewed_by') && v !== null ? String(v) : ['price_monthly', 'quota'].includes(k) ? Number(v) : v]));
type Input = Record<string, any>;
export class ProviderService {
  constructor(readonly pool: Pool) {}
  async ready() { await this.pool.query('SELECT id FROM apis LIMIT 0'); }
  private async transaction<T>(actor: string, action: (client: PoolClient, providerId: string) => Promise<T>) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      // All Provider writes take this lock first; serialize verification, content changes and submission.
      const profile = (await client.query('SELECT id FROM api_providers WHERE user_id=$1 FOR UPDATE', [id(actor)])).rows[0];
      if (!profile) throw new ApiError(403, 'PROVIDER_REQUIRED', 'Provider profile required');
      const result = await action(client, String(profile.id));
      await client.query('COMMIT'); return result;
    } catch (error) {
      await client.query('ROLLBACK');
      if ((error as { code?: string }).code === '23505') throw new ApiError(409, 'RESOURCE_EXISTS', 'Resource already exists');
      if (['23503', '23514', '22003'].includes((error as { code?: string }).code ?? '')) throw new ApiError(409, 'RESOURCE_CONFLICT', 'Resource conflicts with current database state');
      throw error;
    } finally { client.release(); }
  }
  private async verification(client: PoolClient, provider: string) {
    return (await client.query('SELECT * FROM provider_verifications WHERE provider_id=$1 ORDER BY id DESC LIMIT 1 FOR UPDATE', [provider])).rows[0];
  }
  private async owned(client: PoolClient, provider: string, api: string, draft = false) {
    const result = (await client.query('SELECT * FROM apis WHERE id=$1 AND provider_id=$2 FOR UPDATE', [id(api), provider])).rows[0];
    if (!result) throw missing();
    if (draft) requireDraft(result.status);
    return result;
  }
  private async version(client: PoolClient, api: string, version: string) {
    const result = (await client.query('SELECT * FROM api_versions WHERE id=$1 AND api_id=$2', [id(version), api])).rows[0];
    if (!result) throw missing(); return result;
  }
  async getVerification(actor: string) {
    return this.transaction(actor, async (c, p) => { const record = await this.verification(c, p); return record ? row(record) : null; });
  }
  async sendVerification(actor: string, input: Input) {
    return this.transaction(actor, async (c, p) => {
      const latest = await this.verification(c, p);
      if (latest && latest.status !== 'Rejected') throw new ApiError(409, 'VERIFICATION_EXISTS', 'Verification is pending or already verified');
      return row((await c.query('INSERT INTO provider_verifications(provider_id,organization_name,contact_email,evidence_urls) VALUES($1,$2,$3,$4) RETURNING *', [p, input.organizationName, input.contactEmail, JSON.stringify(input.evidenceUrls)])).rows[0]);
    });
  }
  async list(actor: string, page: number, pageSize: number) {
    return this.transaction(actor, async (c, p) => ({
      items: (await c.query('SELECT * FROM apis WHERE provider_id=$1 ORDER BY id DESC LIMIT $2 OFFSET $3', [p, pageSize, (page - 1) * pageSize])).rows.map(row),
      total: Number((await c.query('SELECT COUNT(*) FROM apis WHERE provider_id=$1', [p])).rows[0].count), page, pageSize,
    }));
  }
  async create(actor: string, input: Input) {
    return this.transaction(actor, async (c, p) => {
      requireVerified((await this.verification(c, p))?.status ?? 'Pending');
      return row((await c.query('INSERT INTO apis(provider_id,name,description,category,base_url,tags) VALUES($1,$2,$3,$4,$5,$6) RETURNING *', [p, input.name, input.description, input.category, input.baseUrl, JSON.stringify(input.tags)])).rows[0]);
    });
  }
  async get(actor: string, api: string) { return this.transaction(actor, async (c, p) => row(await this.owned(c, p, api))); }
  async update(actor: string, api: string, input: Input) {
    return this.transaction(actor, async (c, p) => {
      await this.owned(c, p, api, true);
      return row((await c.query('UPDATE apis SET name=$1,description=$2,category=$3,base_url=$4,tags=$5 WHERE id=$6 RETURNING *', [input.name, input.description, input.category, input.baseUrl, JSON.stringify(input.tags), api])).rows[0]);
    });
  }
  async listChild(actor: string, api: string, kind: 'versions' | 'endpoints' | 'plans' | 'documentation') {
    const tables = { versions: 'api_versions', endpoints: 'api_endpoints', plans: 'api_plans', documentation: 'api_documentations' };
    return this.transaction(actor, async (c, p) => { await this.owned(c, p, api); return (await c.query(`SELECT * FROM ${tables[kind]} WHERE api_id=$1 ORDER BY id`, [api])).rows.map(row); });
  }
  async addVersion(actor: string, api: string, input: Input) {
    return this.transaction(actor, async (c, p) => {
      await this.owned(c, p, api, true);
      return row((await c.query('INSERT INTO api_versions(api_id,version,changelog) VALUES($1,$2,$3) RETURNING *', [api, input.version, input.changelog])).rows[0]);
    });
  }
  async updateVersion(actor: string, api: string, version: string, input: Input) {
    return this.transaction(actor, async (c, p) => {
      await this.owned(c, p, api, true); await this.version(c, api, version);
      await c.query('DELETE FROM api_documentations WHERE version_id=$1 AND api_id=$2', [version, api]);
      await c.query('UPDATE api_versions SET openapi_document=NULL WHERE id=$1 AND api_id=$2', [version, api]);
      return row((await c.query('UPDATE api_versions SET version=$1,changelog=$2,updated_at=NOW() WHERE id=$3 AND api_id=$4 RETURNING *', [input.version, input.changelog, version, api])).rows[0]);
    });
  }
  async deleteVersion(actor: string, api: string, version: string) {
    return this.transaction(actor, async (c, p) => { await this.owned(c, p, api, true); await this.version(c, api, version); await c.query('DELETE FROM api_versions WHERE id=$1 AND api_id=$2', [version, api]); });
  }
  async deleteApi(actor: string, api: string) {
    return this.transaction(actor, async (c, p) => { await this.owned(c, p, api, true); await c.query('DELETE FROM apis WHERE id=$1', [api]); });
  }
  async endpoint(actor: string, api: string, input: Input, endpointId?: string) {
    return this.transaction(actor, async (c, p) => {
      await this.owned(c, p, api, true); await this.version(c, api, input.versionId);
      const values = [input.versionId, input.method, input.path, input.description, JSON.stringify(input.parameters ?? []), JSON.stringify(input.requestSchema ?? null), JSON.stringify(input.responseExample ?? null), api];
      const result = endpointId
        ? await c.query('UPDATE api_endpoints SET version_id=$1,method=$2,path=$3,description=$4,parameters=$5,request_schema=$6,response_example=$7,updated_at=NOW() WHERE api_id=$8 AND id=$9 RETURNING *', [...values, id(endpointId)])
        : await c.query('INSERT INTO api_endpoints(version_id,method,path,description,parameters,request_schema,response_example,api_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *', values);
      if (!result.rows[0]) throw missing();
      // Manual edits invalidate imported docs; require a fresh import before submission.
      await c.query('DELETE FROM api_documentations WHERE api_id=$1', [api]);
      await c.query('UPDATE api_versions SET openapi_document=NULL WHERE api_id=$1', [api]);
      return row(result.rows[0]);
    });
  }
  async plan(actor: string, api: string, input: Input, planId?: string) {
    return this.transaction(actor, async (c, p) => {
      await this.owned(c, p, api, true);
      const values = [input.name, input.priceMonthly, input.currency, input.quota, input.rateLimit, api];
      const result = planId
        ? await c.query('UPDATE api_plans SET name=$1,price_monthly=$2,currency=$3,quota=$4,rate_limit=$5,updated_at=NOW() WHERE api_id=$6 AND id=$7 RETURNING *', [...values, id(planId)])
        : await c.query('INSERT INTO api_plans(name,price_monthly,currency,quota,rate_limit,api_id) VALUES($1,$2,$3,$4,$5,$6) RETURNING *', values);
      if (!result.rows[0]) throw missing(); return row(result.rows[0]);
    });
  }
  async deleteChild(actor: string, api: string, child: string, kind: 'endpoints' | 'plans') {
    return this.transaction(actor, async (c, p) => {
      await this.owned(c, p, api, true);
      const table = kind === 'endpoints' ? 'api_endpoints' : 'api_plans';
      if (!(await c.query(`DELETE FROM ${table} WHERE id=$1 AND api_id=$2`, [id(child), api])).rowCount) throw missing();
      if (kind === 'endpoints') {
        await c.query('DELETE FROM api_documentations WHERE api_id=$1', [api]);
        await c.query('UPDATE api_versions SET openapi_document=NULL WHERE api_id=$1', [api]);
      }
    });
  }
  async agreement() {
    const result = (await this.pool.query('SELECT id,version,content,effective_at FROM agreements WHERE is_active AND effective_at<=NOW()')).rows[0];
    if (!result) throw new ApiError(409, 'AGREEMENT_UNAVAILABLE', 'No current agreement configured'); return row(result);
  }
  async legal(actor: string, api: string, input?: Input) {
    return this.transaction(actor, async (c, p) => {
      await this.owned(c, p, api, !!input);
      if (input) {
        const agreement = (await c.query('SELECT id,version FROM agreements WHERE is_active AND effective_at<=NOW() FOR SHARE')).rows[0];
        if (!agreement || agreement.version !== input.agreementVersion) throw new ApiError(409, 'AGREEMENT_CHANGED', 'Accept the current agreement version');
        await c.query('INSERT INTO api_legal_declarations(api_id,agreement_id,ownership_declaration,distribution_rights,data_classification) VALUES($1,$2,$3,$4,$5) ON CONFLICT(api_id) DO UPDATE SET agreement_id=$2,ownership_declaration=$3,distribution_rights=$4,data_classification=$5,accepted_at=NOW(),updated_at=NOW()', [api, agreement.id, input.ownershipDeclaration, input.distributionRights, input.dataClassification]);
      }
      const record = (await c.query('SELECT l.*,a.version AS agreement_version FROM api_legal_declarations l JOIN agreements a ON a.id=l.agreement_id WHERE l.api_id=$1', [api])).rows[0];
      return record ? row(record) : null;
    });
  }
  async import(actor: string, api: string, versionId: string, source: string) {
    // Reject ownership/state before spending time parsing an upload.
    await this.get(actor, api);
    const imported = await importOpenApi(source);
    return this.transaction(actor, async (c, p) => {
      await this.owned(c, p, api, true); await this.version(c, api, versionId);
      await c.query('DELETE FROM api_endpoints WHERE version_id=$1 AND api_id=$2', [versionId, api]);
      for (const endpoint of imported.endpoints) await c.query('INSERT INTO api_endpoints(api_id,version_id,method,path,description,parameters,request_schema,response_example) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',
        [api, versionId, endpoint.method, endpoint.path, endpoint.description || endpoint.summary || `${endpoint.method} ${endpoint.path}`, JSON.stringify(endpoint.parameters), JSON.stringify(endpoint.requestBody ?? null), JSON.stringify(endpoint.responses)]);
      const document = JSON.stringify(imported.documentation);
      await c.query('UPDATE api_versions SET openapi_document=$1,updated_at=NOW() WHERE id=$2 AND api_id=$3', [document, versionId, api]);
      await c.query("INSERT INTO api_documentations(api_id,version_id,source,content) VALUES($1,$2,'OPENAPI_IMPORT',$3) ON CONFLICT(version_id) DO UPDATE SET content=$3,source='OPENAPI_IMPORT',updated_at=NOW()", [api, versionId, document]);
      return { versionId, endpointCount: imported.endpoints.length, title: imported.title };
    });
  }
  async submit(actor: string, api: string) {
    return this.transaction(actor, async (c, p) => {
      const record = await this.owned(c, p, api, true);
      const verification = await this.verification(c, p);
      const agreement = (await c.query('SELECT id,version FROM agreements WHERE is_active AND effective_at<=NOW() FOR SHARE')).rows[0];
      if (!agreement) throw new ApiError(409, 'AGREEMENT_UNAVAILABLE', 'No current agreement configured');
      const legal = (await c.query('SELECT agreement_id FROM api_legal_declarations WHERE api_id=$1', [api])).rows[0];
      // An endpoint and its documentation must belong to the same version.
      const content = (await c.query("SELECT COUNT(*)::int AS n, COUNT(d.id) FILTER (WHERE d.content->'paths'->e.path->LOWER(e.method) IS NOT NULL)::int AS documented FROM api_endpoints e LEFT JOIN api_documentations d ON d.version_id=e.version_id AND d.api_id=e.api_id WHERE e.api_id=$1", [api])).rows[0];
      const plans = (await c.query('SELECT COUNT(*)::int AS n FROM api_plans WHERE api_id=$1 AND is_active', [api])).rows[0];
      submitApi(record.status as ApiState, { verification: (verification?.status ?? 'Pending') as VerificationState,
        metadata: !!(record.name && record.description && record.category && record.base_url), endpoints: content.n,
        documentation: content.n > 0 && content.documented === content.n, plans: plans.n, legal: !!legal,
        acceptedAgreementVersion: legal?.agreement_id === agreement.id ? agreement.version : undefined, currentAgreementVersion: agreement.version });
      return row((await c.query("UPDATE apis SET status='Submitted' WHERE id=$1 RETURNING *", [api])).rows[0]);
    });
  }
  async reopen(actor: string, api: string) {
    return this.transaction(actor, async (c, p) => {
      const record = await this.owned(c, p, api);
      transitionApi(record.status, 'Draft', 'Provider');
      return row((await c.query("UPDATE apis SET status='Draft',submitted_at=NULL,approved_at=NULL WHERE id=$1 RETURNING *", [api])).rows[0]);
    });
  }
}
