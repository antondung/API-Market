import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DailyRequestChart } from './DailyRequestChart';

describe('DailyRequestChart', () => {
  it('renders an empty state when there are no days', () => {
    render(<DailyRequestChart points={[]} />);
    expect(screen.getByTestId('daily-request-chart-empty')).toBeDefined();
    expect(screen.queryByTestId('daily-request-chart')).toBeNull();
  });

  it('draws one bar per day and keeps success and error counts in the label', () => {
    render(
      <DailyRequestChart
        points={[
          {
            date: '2026-11-01',
            requestCount: '1000',
            successCount: '950',
            errorCount: '50',
          },
          {
            date: '2026-11-02',
            requestCount: '500',
            successCount: '490',
            errorCount: '10',
          },
        ]}
      />
    );

    expect(screen.getByTestId('daily-request-chart')).toBeDefined();
    expect(screen.getByText('Thành công')).toBeDefined();
    expect(screen.getByText('Lỗi')).toBeDefined();
    const first = screen.getByTestId('chart-bar-2026-11-01');
    expect(first.getAttribute('aria-label')).toContain('1.000');
    expect(first.getAttribute('aria-label')).toContain('950');
    expect(first.getAttribute('aria-label')).toContain('50');
    expect(screen.getByTestId('chart-bar-2026-11-02').getAttribute('aria-label')).toContain('500');
  });

  it('scales a count past Number.MAX_SAFE_INTEGER without throwing', () => {
    render(
      <DailyRequestChart
        points={[
          {
            date: '2026-11-03',
            requestCount: '9007199254740995',
            successCount: '9007199254740990',
            errorCount: '5',
          },
        ]}
      />
    );

    const bar = screen.getByTestId('chart-bar-2026-11-03');
    expect(bar.getAttribute('aria-label')).toContain(
      (9007199254740995n).toLocaleString('vi-VN')
    );
  });

  it('renders a single-series bar when success and error counts are absent', () => {
    render(
      <DailyRequestChart
        points={[{ date: '2026-11-04', requestCount: '42' }]}
      />
    );

    expect(screen.queryByText('Thành công')).toBeNull();
    expect(screen.getByTestId('chart-bar-2026-11-04').getAttribute('aria-label')).toContain('42');
  });
});
