import { describe, expect, it } from 'vitest';
import { canUseConsumerWorkspace, canUseProviderWorkspace } from './workspaceRole';

describe('workspace role guards', () => {
  it('lets Consumer and Provider use the consumer workspace and blocks Admin', () => {
    expect(canUseConsumerWorkspace(undefined)).toBe(true);
    expect(canUseConsumerWorkspace('USER')).toBe(true);
    expect(canUseConsumerWorkspace('Consumer')).toBe(true);
    expect(canUseConsumerWorkspace('API_PROVIDER')).toBe(true);
    expect(canUseConsumerWorkspace('ADMIN')).toBe(false);
    expect(canUseConsumerWorkspace('admin')).toBe(false);
  });

  it('reserves the provider dashboard for provider roles', () => {
    expect(canUseProviderWorkspace(undefined)).toBe(true);
    expect(canUseProviderWorkspace('API_PROVIDER')).toBe(true);
    expect(canUseProviderWorkspace('Provider')).toBe(true);
    expect(canUseProviderWorkspace('USER')).toBe(false);
    expect(canUseProviderWorkspace('Consumer')).toBe(false);
    expect(canUseProviderWorkspace('ADMIN')).toBe(false);
  });
});
