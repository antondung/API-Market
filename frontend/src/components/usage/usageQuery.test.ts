import { describe, expect, it } from 'vitest';
import {
  barSharePercent,
  formatUsageDayLabel,
  marketplaceApiIdError,
  marketplaceEndpointIdError,
  usageRatePercent,
  validateUsageDateRange,
} from './usageQuery';

describe('usageQuery contract helpers', () => {
  it('accepts only positive 32-bit marketplace API ids and endpoint ids', () => {
    expect(marketplaceApiIdError('')).toBeNull();
    expect(marketplaceApiIdError('  12  ')).toBeNull();
    expect(marketplaceApiIdError('2147483647')).toBeNull();
    expect(marketplaceApiIdError('0')).toContain('số nguyên dương');
    expect(marketplaceApiIdError('api_weather')).toContain('2147483647');
    expect(marketplaceApiIdError('2147483648')).toContain('số nguyên dương');

    expect(marketplaceEndpointIdError('')).toBeNull();
    expect(marketplaceEndpointIdError('42')).toBeNull();
    expect(marketplaceEndpointIdError('0')).toContain('số nguyên dương');
    expect(marketplaceEndpointIdError('ep_test')).toContain('2147483647');
  });

  it('rejects inverted ranges and windows longer than 365 days', () => {
    expect(validateUsageDateRange()).toBeNull();
    expect(validateUsageDateRange('2026-11-01', '')).toBeNull();
    expect(validateUsageDateRange('2026-11-04', '2026-11-01')).toContain('không được lớn hơn');
    expect(validateUsageDateRange('2026-01-01', '2027-01-05')).toContain('365 ngày');
    expect(validateUsageDateRange('2026-01-01', '2026-06-01')).toBeNull();
  });

  it('computes rates with BigInt and refuses a fake 100% when there is no traffic', () => {
    expect(usageRatePercent(0n, 0n)).toBeNull();
    expect(usageRatePercent('0', '1500')).toBe(0);
    expect(usageRatePercent('1440', '1500')).toBe(96);
    expect(usageRatePercent('60', '1500')).toBe(4);
    expect(usageRatePercent(9007199254740995n, 9007199254740995n)).toBe(100);
    expect(barSharePercent(0n, 10n)).toBe(0);
    expect(barSharePercent(500n, 1000n)).toBe(50);
    expect(barSharePercent(9007199254740995n, 9007199254740995n)).toBe(100);
  });

  it('formats date-only labels without shifting the calendar day', () => {
    expect(formatUsageDayLabel('2026-11-04')).toBe('04/11');
    expect(formatUsageDayLabel('2026-11-04T17:00:00.000Z')).toBe('04/11');
    expect(formatUsageDayLabel('không-phải-ngày')).toBe('không-phải-ngày');
  });
});
