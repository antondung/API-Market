import React, { useMemo } from 'react';
import { formatBigIntCount, parseSafeBigInt } from '../../services/sprint4Types';
import { barSharePercent, formatUsageDayLabel } from './usageQuery';

export interface DailyRequestPoint {
  date: string;
  requestCount: string;
  successCount?: string;
  errorCount?: string;
}

interface DailyRequestChartProps {
  points: DailyRequestPoint[];
  title?: string;
}

export const DailyRequestChart: React.FC<DailyRequestChartProps> = ({
  points,
  title = 'Biểu đồ số lượt gọi theo ngày',
}) => {
  const maxCount = useMemo(
    () => points.reduce((acc, point) => {
      const count = parseSafeBigInt(point.requestCount);
      return count > acc ? count : acc;
    }, 0n),
    [points]
  );

  const showSplit = points.some(
    (point) => point.successCount !== undefined && point.errorCount !== undefined
  );

  if (points.length === 0) {
    return (
      <div
        data-testid="daily-request-chart-empty"
        className="rounded-2xl border border-dashed border-outline-variant/40 p-6 text-center text-body-sm text-on-surface-variant"
      >
        Chưa có dữ liệu để vẽ biểu đồ theo ngày.
      </div>
    );
  }

  return (
    <div data-testid="daily-request-chart" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-body-md font-bold text-on-surface">{title}</h3>
        {showSplit && (
          <div className="flex items-center gap-3 text-body-xs text-on-surface-variant">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              Thành công
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-error" />
              Lỗi
            </span>
          </div>
        )}
      </div>
      <div
        role="img"
        aria-label={title}
        className="overflow-x-auto rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4"
      >
        <div className="flex items-end gap-2 min-h-[168px]">
          {points.map((point) => {
            const count = parseSafeBigInt(point.requestCount);
            const height = barSharePercent(count, maxCount);
            const visibleHeight = count > 0n ? Math.max(height, 4) : 0;
            const success = point.successCount !== undefined ? parseSafeBigInt(point.successCount) : null;
            const error = point.errorCount !== undefined ? parseSafeBigInt(point.errorCount) : null;
            const splitBase = success !== null && error !== null ? success + error : 0n;
            const successPct = splitBase > 0n && success !== null
              ? barSharePercent(success, splitBase)
              : 0;
            const dayLabel = formatUsageDayLabel(point.date);
            const countLabel = formatBigIntCount(count);
            const detail = success !== null && error !== null
              ? `${dayLabel}: ${countLabel} lượt, thành công ${formatBigIntCount(success)}, lỗi ${formatBigIntCount(error)}`
              : `${dayLabel}: ${countLabel} lượt`;

            return (
              <div
                key={point.date}
                data-testid={`chart-bar-${point.date}`}
                className="flex w-12 shrink-0 flex-col items-center"
                aria-label={detail}
              >
                <div
                  className="flex h-36 w-8 items-end overflow-hidden rounded-lg bg-surface-container-high"
                  title={detail}
                >
                  <div
                    className="flex w-full flex-col justify-end"
                    style={{ height: `${visibleHeight}%` }}
                  >
                    {success !== null && error !== null && splitBase > 0n ? (
                      <>
                        <div className="w-full bg-error" style={{ height: `${100 - successPct}%` }} />
                        <div className="w-full bg-emerald-500" style={{ height: `${successPct}%` }} />
                      </>
                    ) : (
                      <div className="h-full w-full bg-primary" />
                    )}
                  </div>
                </div>
                <span className="mt-1 text-center text-[10px] leading-tight text-on-surface-variant">
                  {dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
