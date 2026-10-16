import { z } from 'zod';
import { ApiError } from './auth.js';

// Request contracts only: IDs, persistence and agreement version come from the server.
const text = (max: number) => z.string().trim().min(1).max(max).regex(/^[^\u0000]*$/, 'NUL characters are not allowed');
const url = z.string().url().refine(value => ['http:', 'https:'].includes(new URL(value).protocol), 'HTTP(S) URL required');
export const providerSchemas = {
  verification: z.object({ organizationName: text(200), contactEmail: z.string().email().max(254), evidenceUrls: z.array(url).min(1).max(10) }).strict(),
  api: z.object({ name: text(200), description: text(10000), category: text(100), baseUrl: url, tags: z.array(text(50)).max(20) }).strict(),
  version: z.object({ version: text(64), changelog: text(5000) }).strict(),
  endpoint: z.object({ versionId: z.string().regex(/^[1-9][0-9]{0,9}$/), method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'TRACE']), path: text(2048).regex(/^\//), description: text(5000), parameters: z.array(z.object({ name: text(200), in: z.enum(['path', 'query', 'header', 'cookie', 'body', 'formData']), required: z.boolean(), schema: z.record(z.string(), z.unknown()).optional(), description: text(5000).optional() }).strict()).max(100).default([]), requestSchema: z.record(z.string(), z.unknown()).nullable().optional(), responseExample: z.unknown().optional() }).strict(),
  plan: z.object({ name: z.enum(['Free', 'Basic', 'Pro']), priceMonthly: z.number().finite().min(0).max(999999999999.99).refine(v => Math.abs(v * 100 - Math.round(v * 100)) < 0.001, 'At most two decimal places'), currency: z.string().regex(/^[A-Z]{3}$/), quota: z.number().int().min(1).max(Number.MAX_SAFE_INTEGER), rateLimit: z.number().int().min(1).max(1000000) }).strict().refine(value => value.name !== 'Free' || value.priceMonthly === 0, { path: ['priceMonthly'], message: 'Free plan price must be zero' }),
  legal: z.object({ ownershipDeclaration: text(10000), distributionRights: text(10000), dataClassification: z.enum(['Public', 'Internal', 'Confidential', 'Restricted']), agreementVersion: text(64), accepted: z.literal(true),
    processesPersonalData: z.boolean(), personalDataTypes: z.array(z.enum(['FullName', 'Email', 'Phone', 'Geolocation', 'Financial', 'Credentials', 'HealthBiometrics', 'Other'])).max(8), dataProcessingPurpose: text(5000).optional(),
  }).strict().superRefine((value, ctx) => {
    if (value.processesPersonalData && (!value.personalDataTypes.length || !value.dataProcessingPurpose)) ctx.addIssue({ code: 'custom', path: ['personalDataTypes'], message: 'Declare data types and processing purpose when processing personal data' });
    if (!value.processesPersonalData && (value.personalDataTypes.length || value.dataProcessingPurpose !== undefined)) ctx.addIssue({ code: 'custom', path: ['processesPersonalData'], message: 'No data types or purpose allowed when personal data is not processed' });
    if (new Set(value.personalDataTypes).size !== value.personalDataTypes.length) ctx.addIssue({ code: 'custom', path: ['personalDataTypes'], message: 'Data types must be unique' });
  }),
};
export type ApiState = 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Published' | 'Rejected';
export type VerificationState = 'Pending' | 'Verified' | 'Rejected';
export function validateProviderJson(input: unknown) {
  const visit = (value: unknown, depth: number) => {
    if (depth > 64) throw new ApiError(400, 'INVALID_INPUT', 'Input nesting limit exceeded');
    if (typeof value === 'string' && value.includes('\u0000')) throw new ApiError(400, 'INVALID_INPUT', 'NUL characters are not allowed');
    if (value && typeof value === 'object') for (const [key, child] of Object.entries(value)) { visit(key, depth + 1); visit(child, depth + 1); }
  };
  visit(input, 0);
}
export function requireProviderOwner(role: string, actorId: string, ownerId: string) {
  if (role !== 'Provider' || actorId !== ownerId) throw new ApiError(403, 'FORBIDDEN', 'Provider owner required');
}
export function requireVerified(state: VerificationState) {
  if (state !== 'Verified') throw new ApiError(403, 'PROVIDER_NOT_VERIFIED', 'Verified Provider required');
}
export function requireDraft(state: ApiState) {
  if (state !== 'Draft') throw new ApiError(409, 'INVALID_STATE', 'Only Draft APIs can be edited');
}
export interface SubmissionReadiness {
  verification: VerificationState; metadata: boolean; endpoints: number;
  documentation: boolean; plans: number; legal: boolean;
  acceptedAgreementVersion?: string; currentAgreementVersion: string;
}
export function submitApi(state: ApiState, readiness: SubmissionReadiness): ApiState {
  requireVerified(readiness.verification);
  requireDraft(state);
  const missing = [!readiness.metadata && 'metadata', readiness.endpoints < 1 && 'endpoints',
    !readiness.documentation && 'documentation', readiness.plans < 1 && 'plans', !readiness.legal && 'legal',
    readiness.acceptedAgreementVersion !== readiness.currentAgreementVersion && 'agreement'].filter(Boolean);
  if (missing.length) throw new ApiError(400, 'SUBMISSION_INCOMPLETE', `Missing submission requirements: ${missing.join(', ')}`);
  return 'Submitted';
}
// Shared transition policy for integration; Admin HTTP/services belong to Dũng.
export function transitionApi(state: ApiState, next: ApiState, role: 'Provider' | 'Admin', reason?: string): ApiState {
  const adminTransitions: Partial<Record<ApiState, ApiState[]>> = {
    Submitted: ['Under Review'], 'Under Review': ['Approved', 'Rejected'], Approved: ['Published'],
  };
  const allowed = role === 'Admin' ? adminTransitions[state] ?? [] : state === 'Rejected' ? ['Draft'] : [];
  if (!allowed.includes(next)) throw new ApiError(409, 'INVALID_STATE', 'Invalid workflow transition');
  if (next === 'Rejected' && !reason?.trim()) throw new ApiError(400, 'REJECTION_REASON_REQUIRED', 'Rejection reason required');
  return next;
}
