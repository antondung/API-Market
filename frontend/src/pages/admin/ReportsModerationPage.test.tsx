import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ReportsModerationPage } from './ReportsModerationPage';
import * as reportApi from '../../services/reportApi';

const pendingReport: reportApi.AdminReport = {
  id: '42',
  apiId: '7',
  apiName: 'Suspicious Endpoint API',
  category: 'Security Vulnerability',
  description: 'High 5xx error rate and potential SSRF vector reported by automated scanner.',
  status: 'Pending',
  apiStatus: 'Published',
  createdAt: '2026-10-25T10:00:00.000Z',
  actionTaken: null,
};

vi.mock('../../i18n', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

// Keep error formatting deterministic so the alert text is the failure message itself.
vi.mock('../../services/authApi', () => ({
  formatBackendErrorMessage: (error: unknown) => (error instanceof Error ? error.message : 'Unknown error'),
}));

describe('ReportsModerationPage - Admin moderation against the real API', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('loads the moderation queue from GET /api/admin/reports', async () => {
    const listSpy = vi.spyOn(reportApi, 'listReportsForAdmin').mockResolvedValue({
      items: [pendingReport], total: 1, page: 1, pageSize: 20,
    });

    render(<ReportsModerationPage />);

    expect(await screen.findByText('Suspicious Endpoint API')).toBeDefined();
    expect(screen.getByText(/High 5xx error rate/i)).toBeDefined();
    // The queue must come from the backend, not from local storage.
    expect(listSpy).toHaveBeenCalledWith(1, 20, undefined);
  });

  it('shows an empty state when the backend returns no reports', async () => {
    vi.spyOn(reportApi, 'listReportsForAdmin').mockResolvedValue({
      items: [], total: 0, page: 1, pageSize: 20,
    });

    render(<ReportsModerationPage />);

    await waitFor(() => expect(screen.getByText('No Reports Filed')).toBeDefined());
  });

  it('offers Suspend for a Published API and Restore for a Suspended one', async () => {
    vi.spyOn(reportApi, 'listReportsForAdmin').mockResolvedValue({
      items: [pendingReport, { ...pendingReport, id: '43', status: 'Resolved', apiStatus: 'Suspended', actionTaken: 'Suspend: confirmed' }],
      total: 2, page: 1, pageSize: 20,
    });

    render(<ReportsModerationPage />);

    expect(await screen.findByRole('button', { name: /Suspend API & Resolve/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Khôi phục API/i })).toBeDefined();
  });

  it('paginates when the backend reports more than one page', async () => {
    const listSpy = vi.spyOn(reportApi, 'listReportsForAdmin').mockResolvedValue({
      items: [pendingReport], total: 51, page: 1, pageSize: 20,
    });

    render(<ReportsModerationPage />);

    expect(await screen.findByText('Trang 1 / 3')).toBeDefined();
    expect(listSpy).toHaveBeenCalledWith(1, 20, undefined);
  });

  it('does not offer Suspend on a report that is already resolved', async () => {
    vi.spyOn(reportApi, 'listReportsForAdmin').mockResolvedValue({
      items: [{ ...pendingReport, id: '50', status: 'Resolved', apiStatus: 'Published', actionTaken: 'Dismiss: no evidence' }],
      total: 1, page: 1, pageSize: 20,
    });

    render(<ReportsModerationPage />);

    await screen.findByText('Suspicious Endpoint API');
    // A closed report must not expose a new decision the backend would reject with 409.
    expect(screen.queryByRole('button', { name: /Suspend API & Resolve/i })).toBeNull();
  });

  it('surfaces a backend failure instead of pretending the queue is empty', async () => {
    vi.spyOn(reportApi, 'listReportsForAdmin').mockRejectedValue(new Error('Network down'));

    render(<ReportsModerationPage />);

    expect(await screen.findByRole('alert')).toBeDefined();
    expect(screen.getByRole('button', { name: /Thử lại/i })).toBeDefined();
  });
});