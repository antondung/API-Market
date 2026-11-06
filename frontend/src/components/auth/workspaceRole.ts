const CONSUMER_WORKSPACE_ROLES = new Set([
  'USER',
  'user',
  'Consumer',
  'consumer',
  'API_PROVIDER',
  'Provider',
  'provider',
]);

const PROVIDER_WORKSPACE_ROLES = new Set([
  'API_PROVIDER',
  'Provider',
  'provider',
]);

/**
 * Missing role is treated as allowed so route guards and standalone renders
 * keep their existing behavior. A known foreign role is rejected.
 */
export function canUseConsumerWorkspace(role: string | null | undefined): boolean {
  if (!role) return true;
  return CONSUMER_WORKSPACE_ROLES.has(role);
}

export function canUseProviderWorkspace(role: string | null | undefined): boolean {
  if (!role) return true;
  return PROVIDER_WORKSPACE_ROLES.has(role);
}
