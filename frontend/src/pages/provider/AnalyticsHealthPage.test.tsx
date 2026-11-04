import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnalyticsHealthPage } from './AnalyticsHealthPage';
import { AppProvider } from '../../context/AppContext';

vi.mock('../../i18n', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

describe('AnalyticsHealthPage - Honest Telemetry & SLA Targets', () => {
  it('does NOT display fabricated measured latencies or regional claims', () => {
    render(
      <AppProvider>
        <AnalyticsHealthPage />
      </AppProvider>
    );

    // Should indicate no real quantile data instead of hardcoded numbers
    const noDataBadges = screen.getAllByText('Chưa có dữ liệu thực');
    expect(noDataBadges.length).toBeGreaterThanOrEqual(4);

    // Target SLA indicators must be present
    expect(screen.getByText('Target SLA: < 20 ms')).toBeDefined();
    expect(screen.getByText('Target SLA: < 30 ms')).toBeDefined();
    expect(screen.getByText('Target SLA: < 50 ms')).toBeDefined();
    expect(screen.getByText('Target SLA: < 100 ms')).toBeDefined();

    // Fabricated measured strings must NOT appear
    expect(screen.queryByText('18 ms')).toBeNull();
    expect(screen.queryByText('28 ms')).toBeNull();
    expect(screen.queryByText('42 ms')).toBeNull();
    expect(screen.queryByText('64 ms')).toBeNull();
    expect(screen.queryByText('Measured latency')).toBeNull();
    expect(screen.queryByText('Measured ceiling')).toBeNull();

    // Regional edge section must NOT claim live 12ms/18ms/24ms or 1.8ms overhead
    expect(screen.queryByText('12 ms')).toBeNull();
    expect(screen.queryByText('24 ms')).toBeNull();
    expect(screen.queryByText(/Gateway Overhead: 1\.8ms/i)).toBeNull();
    expect(screen.getByText(/Mục tiêu SLA — Chưa có dữ liệu thực/i)).toBeDefined();
  });
});
