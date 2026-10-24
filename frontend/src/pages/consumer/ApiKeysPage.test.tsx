import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ApiKeysPage } from './ApiKeysPage';

let mockCurrentUser: { id: string; email: string; role: string } | null = {
  id: 'user-consumer-1',
  email: 'consumer@apihub.vn',
  role: 'Consumer',
};

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: mockCurrentUser,
    isAuthenticated: true,
  }),
}));

vi.mock('../../i18n', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

describe('ApiKeysPage Security & Zero Plaintext Integrity', () => {
  beforeEach(() => {
    mockCurrentUser = {
      id: 'user-consumer-1',
      email: 'consumer@apihub.vn',
      role: 'Consumer',
    };
    vi.clearAllMocks();
  });

  it('renders honest empty state awaiting Backend API Keys Service without hardcoded demo keys', () => {
    render(<ApiKeysPage />);

    // Zero fake/mock keys rendered
    expect(screen.queryByText('key_sand_demo_01')).toBeNull();
    expect(screen.queryByText('key_prod_demo_02')).toBeNull();
    expect(screen.queryByText('sk_live_demo_9876543210')).toBeNull();
    expect(screen.queryByText('sk_test_demo_1234567890')).toBeNull();

    // Honest empty state header and Sprint 4 notice
    expect(screen.getByText('Chưa có API key nào được cấp phát')).toBeDefined();
    expect(
      screen.getByText(/Dịch vụ quản trị API Keys trên Backend đang được hoàn thiện trong Sprint 4/)
    ).toBeDefined();
  });

  it('displays Zero Plaintext Policy advisory banner', () => {
    render(<ApiKeysPage />);

    expect(screen.getByText(/Zero Plaintext Policy & Cryptographic Generation:/)).toBeDefined();
    expect(screen.getByText(/không sinh bằng Math.random\(\) tại trình duyệt/)).toBeDefined();
  });

  it('disables Create API Key action safely awaiting backend service', () => {
    render(<ApiKeysPage />);

    // Top action opens modal
    const topCreateBtn = screen.getByRole('button', { name: /addCreate New API Key$/i });
    fireEvent.click(topCreateBtn);

    // Modal title appears
    expect(screen.getByText('Tạo API Key Mới')).toBeDefined();

    // Submit button in modal is disabled safely
    const submitBtn = screen.getByRole('button', { name: /Tạo Khóa \(Chờ Sprint 4\)/i });
    expect(submitBtn.hasAttribute('disabled')).toBe(true);
    expect(submitBtn.getAttribute('title')).toBe(
      'Tính năng sẽ kích hoạt cùng Backend API Keys Service trong Sprint 4'
    );
  });

  it('wipes secret input and state on modal cancel and close', () => {
    render(<ApiKeysPage />);

    fireEvent.click(screen.getByRole('button', { name: /addCreate New API Key$/i }));
    const nameInput = screen.getByPlaceholderText(/e.g. Production Backend Cluster/i);
    fireEvent.change(nameInput, { target: { value: 'Secret Key Test' } });
    expect((nameInput as HTMLInputElement).value).toBe('Secret Key Test');

    // Cancel modal
    const cancelBtn = screen.getByRole('button', { name: /Hủy/i });
    fireEvent.click(cancelBtn);

    // Reopen modal: verify clean state
    fireEvent.click(screen.getByRole('button', { name: /addCreate New API Key$/i }));
    const reopenedInput = screen.getByPlaceholderText(/e.g. Production Backend Cluster/i);
    expect((reopenedInput as HTMLInputElement).value).toBe('');
  });

  it('does not store secrets in localStorage or sessionStorage', () => {
    const localSpy = vi.spyOn(Storage.prototype, 'setItem');
    const sessionSpy = vi.spyOn(sessionStorage, 'setItem');

    render(<ApiKeysPage />);

    expect(localSpy).not.toHaveBeenCalledWith(expect.stringMatching(/api.*key|secret/i), expect.anything());
    expect(sessionSpy).not.toHaveBeenCalledWith(expect.stringMatching(/api.*key|secret/i), expect.anything());

    localSpy.mockRestore();
    sessionSpy.mockRestore();
  });

  it('supports toggling between card and table view modes', () => {
    render(<ApiKeysPage />);

    const cardModeBtn = screen.getByTitle('Xem dạng thẻ');
    const tableModeBtn = screen.getByTitle('Xem dạng bảng');

    expect(cardModeBtn).toBeDefined();
    expect(tableModeBtn).toBeDefined();

    fireEvent.click(tableModeBtn);
    fireEvent.click(cardModeBtn);
  });
});
