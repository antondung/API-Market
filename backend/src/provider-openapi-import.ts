import SwaggerParser from '@apidevtools/swagger-parser';
import { parseDocument } from 'yaml';

export class ImportError extends Error {
  readonly code = 'OPENAPI_IMPORT_INVALID';
  constructor(readonly details: { field: string; message: string }[]) { super('Invalid OpenAPI document'); }
}
type JsonObject = Record<string, any>;
const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'];
export async function importOpenApi(source: string) {
  if (Buffer.byteLength(source, 'utf8') > 1024 * 1024) throw new ImportError([{ field: '$', message: 'Maximum file size is 1 MiB' }]);
  const parsed = parseDocument(source, { uniqueKeys: true });
  if (parsed.errors.length) throw new ImportError(parsed.errors.map(error => ({ field: error.linePos?.[0] ? `line:${error.linePos[0].line}:column:${error.linePos[0].col}` : '$', message: error.code })));
  let document: JsonObject;
  try { document = parsed.toJS({ maxAliasCount: 50 }); }
  catch { throw new ImportError([{ field: '$', message: 'Invalid or excessive YAML aliases' }]); }
  if (!document || typeof document !== 'object' || Array.isArray(document)) throw new ImportError([{ field: '$', message: 'Document must be an object' }]);
  if (document.swagger !== '2.0' && !/^3\.0\.\d+$/.test(document.openapi ?? '')) throw new ImportError([{ field: '/openapi', message: 'Supported versions: Swagger 2.0 and OpenAPI 3.0.x' }]);
  const issues: { field: string; message: string }[] = [];
  let nodes = 0;
  const walk = (value: any, path: string, depth: number, ancestors: Set<object>) => {
    if (++nodes > 50000 || depth > 64) throw new ImportError([{ field: path, message: 'Document complexity limit exceeded' }]);
    if (!value || typeof value !== 'object') return;
    if (ancestors.has(value)) throw new ImportError([{ field: path, message: 'Recursive YAML aliases are unsupported' }]);
    const chain = new Set(ancestors).add(value);
    for (const [key, child] of Object.entries(value)) {
      const field = `${path}/${key.replace(/~/g, '~0').replace(/\//g, '~1')}`;
      if (key === '$ref' && (typeof child !== 'string' || !child.startsWith('#/'))) issues.push({ field, message: 'Only local document references are allowed' });
      walk(child, field, depth + 1, chain);
    }
  };
  walk(document, '', 0, new Set());
  if (issues.length) throw new ImportError(issues);
  let api: JsonObject;
  try {
    api = await SwaggerParser.validate(document as any, { resolve: { file: false, http: false }, dereference: { circular: false } }) as JsonObject;
  } catch (error) {
    const e = error as { details?: { instancePath?: string; message?: string }[]; path?: string[] };
    throw new ImportError(e.details?.length ? e.details.map(item => ({ field: item.instancePath || '$', message: item.message ?? 'Invalid specification' })) : [{ field: e.path?.join('/') || '$', message: 'Invalid schema, unresolved reference or circular reference' }]);
  }
  const endpoints = Object.entries(api.paths ?? {}).flatMap(([path, raw]) => {
    const item = raw as JsonObject;
    return methods.filter(method => item[method]).map(method => {
      const operation = item[method] as JsonObject;
      const parameters = new Map<string, JsonObject>();
      for (const parameter of [...(item.parameters ?? []), ...(operation.parameters ?? [])]) parameters.set(`${parameter.in}:${parameter.name}`, parameter);
      return { method: method.toUpperCase(), path, operationId: operation.operationId,
        summary: operation.summary ?? '', description: operation.description ?? '',
        parameters: [...parameters.values()], requestBody: operation.requestBody,
        responses: operation.responses, security: operation.security ?? api.security ?? [] };
    });
  });
  if (!endpoints.length) throw new ImportError([{ field: '/paths', message: 'At least one operation is required' }]);
  return { title: api.info.title as string, version: api.info.version as string,
    endpoints, documentation: JSON.parse(JSON.stringify(api)) as JsonObject };
}
