import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReportsModerationPage } from './ReportsModerationPage';

const mockReports = [
  {
    id: 'rep-1',
    apiId: 'api-1',
    apiName: 'Suspicious Endpoint API',
    category: 'Vulnerability',
    description: 'High 5xx error rate and potential SSRF vector reported by automated scanner.',
    reportedBy: 'Security Lead',
    reporterEmail: 'sec@apihub.vn',
    status: 'Pending',
    createdAt: '2026-10-25T10:00:00.000Z',
    actionTaken: null,
  },
];

vi.mock('../../context/AppContext', () => ({
  useApp: () => ({
    reports: mockReports,
  }),
}));

vi.mock('../../i18n', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

describe('ReportsModerationPage - PR #81 Backend Grounding & Data Integrity', () => {
  it('renders preview badges and read-only preview notice without fake mutations', () => {
    render(<ReportsModerationPage />);

    // Must display preview mode and backend dependency badges
    expect(screen.getByText(/Bản xem trước \/ Preview Mode/i)).toBeDefined();
    expect(screen.getByText(/Chờ Backend PR #81/i)).toBeDefined();

    // Must display clear read-only advisory
    expect(screen.getByText(/Chế độ Xem trước \(Read-Only Preview\):/i)).toBeDefined();

    // Must display report details
    expect(screen.getByText('Suspicious Endpoint API')).toBeDefined();
    expect(screen.getByText(/High 5xx error rate/i)).toBeDefined();

    // Action buttons must be strictly disabled to prevent fake local mutations
    const suspendBtn = screen.getByRole('button', { name: /Suspend API & Resolve/i });
    const resolveBtn = screen.getByRole('button', { name: /Resolve Only/i });
    const dismissBtn = screen.getByRole('button', { name: /Dismiss/i });

    expect(suspendBtn.hasAttribute('disabled')).toBe(true);
    expect(resolveBtn.hasAttribute('disabled')).toBe(true);
    expect(dismissBtn.hasAttribute('disabled')).toBe(true);
  });
});
