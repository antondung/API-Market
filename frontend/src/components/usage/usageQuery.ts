import { isValidPositiveIntegerApiId } from '../../utils/apiSnippetGenerator';
import { parseSafeBigInt } from '../../services/sprint4Types';

/**
 * Backend usage filters require marketplaceId: a positive 32-bit integer.
 * Empty input means "no API filter".
 */
export function marketplaceApiIdError(raw: string | null | undefined): string | null {
  const value = (raw ?? '').trim();
  if (!value) return null;
  if (!isValidPositiveIntegerApiId(value)) {
    return 'API ID phải là số nguyên dương từ 1 đến 2147483647.';
  }
  return null;
}

/**
 * Same 365-day window the usage endpoints enforce.
 * A single bound is allowed; the backend fills the other side.
 */
export function validateUsageDateRange(from?: string, to?: string): string | null {
  const start = (from ?? '').trim();
  const end = (to ?? '').trim();
  if (!start || !end) return null;
  const fromTime = new Date(start).getTime();
  const toTime = new Date(end).getTime();
  if (Number.isNaN(fromTime) || Number.isNaN(toTime)) {
    return 'Ngày không hợp lệ.';
  }
  if (fromTime > toTime) {
    return 'Ngày bắt đầu không được lớn hơn ngày kết thúc.';
  }
  const diffDays = (toTime - fromTime) / (1000 * 60 * 60 * 24);
  if (diffDays > 365) {
    return 'Khoảng thời gian không được vượt quá 365 ngày.';
  }
  return null;
}

/**
 * Integer percent in [0, 100] using BigInt so values past Number.MAX_SAFE_INTEGER stay exact.
 * Returns null when there is no traffic, so the UI does not show a fake 100%.
 */
export function usageRatePercent(
  part: bigint | string | number | null | undefined,
  total: bigint | string | number | null | undefined
): number | null {
  const whole = typeof total === 'bigint' ? total : parseSafeBigInt(total);
  if (whole <= 0n) return null;
  const numerator = typeof part === 'bigint' ? part : parseSafeBigInt(part);
  if (numerator <= 0n) return 0;
  const capped = numerator > whole ? whole : numerator;
  return Number((capped * 10000n) / whole) / 100;
}

/**
 * Bar height as a percentage of the busiest day. Zero stays zero.
 */
export function barSharePercent(count: bigint, max: bigint): number {
  if (max <= 0n || count <= 0n) return 0;
  const capped = count > max ? max : count;
  const share = Number((capped * 10000n) / max) / 100;
  return share > 100 ? 100 : share;
}

/** Compact day label for chart axes. Date-only strings are not shifted by timezone. */
export function formatUsageDayLabel(dateStr: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec((dateStr || '').trim());
  if (!match) return dateStr || '-';
  return `${match[3]}/${match[2]}`;
}
