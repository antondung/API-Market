import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ApiKeysPage } from './ApiKeysPage';
import * as consumerApi from '../../services/consumerApi';
import { ApiError } from '../../services/authApi';

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

describe('ApiKeysPage Real Backend Integration & Security Lifecycle', () => {
  beforeEach(() => {
    mockCurrentUser = {
      id: 'user-consumer-1',
      email: 'consumer@apihub.vn',
      role: 'Consumer',
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders honest empty state when backend returns 0 keys', async () => {
    vi.spyOn(consumerApi, 'listConsumerApiKeys').mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
    });

    render(<ApiKeysPage />);

    expect(await screen.findByText('Chưa có API key nào được cấp phát')).toBeDefined();
    expect(screen.getByText(/Tạo API Key đầu tiên để bắt đầu gọi API của nhà cung cấp/)).toBeDefined();
  });

  it('displays real keys returned by backend and supports card/table toggle', async () => {
    vi.spyOn(consumerApi, 'listConsumerApiKeys').mockResolvedValue({
      items: [
        {
          id: '1',
          apiId: '10',
          keyPrefix: 'ak_live_abc123',
          label: 'Weather Cluster Key',
          isActive: true,
          lastUsedAt: '2026-10-27T01:00:00.000Z',
          revokedAt: null,
          createdAt: '2026-10-26T00:00:00.000Z',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });

    render(<ApiKeysPage />);

    expect(await screen.findByText('Weather Cluster Key')).toBeDefined();
    expect(screen.getByText('10')).toBeDefined();
    expect(screen.getByText('Active')).toBeDefined();

    // Toggle to table view
    const tableBtn = screen.getByTitle('Xem dạng bảng');
    fireEvent.click(tableBtn);
    expect(await screen.findByText('Weather Cluster Key')).toBeDefined();
  });

  it('creates key, reveals secret once, and never persists plaintext to storage', async () => {
    let callCount = 0;
    vi.spyOn(consumerApi, 'listConsumerApiKeys').mockImplementation(async () => {
      callCount += 1;
      if (callCount === 1) {
        return { items: [], total: 0, page: 1, pageSize: 20 };
      }
      return {
        items: [
          {
            id: '2',
            apiId: '15',
            keyPrefix: 'ak_live_xyz999',
            label: 'New Payment Key',
            isActive: true,
            lastUsedAt: null,
            revokedAt: null,
            createdAt: '2026-10-27T02:00:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      };
    });

    const createSpy = vi.spyOn(consumerApi, 'createConsumerApiKey').mockResolvedValueOnce({
      id: '2',
      apiId: '15',
      keyPrefix: 'ak_live_xyz999',
      label: 'New Payment Key',
      isActive: true,
      lastUsedAt: null,
      revokedAt: null,
      createdAt: '2026-10-27T02:00:00.000Z',
      key: 'ak_live_SUPER_SECRET_REVEAL_ONCE',
    });

    const localSpy = vi.spyOn(Storage.prototype, 'setItem');
    const sessionSpy = vi.spyOn(sessionStorage, 'setItem');

    render(<ApiKeysPage />);

    // Wait for initial load
    expect(await screen.findByText('Chưa có API key nào được cấp phát')).toBeDefined();

    // Click Create New API Key (top button)
    const createBtns = screen.getAllByRole('button', { name: /Create New API Key/i });
    fireEvent.click(createBtns[0]);

    // Fill form
    const apiIdInput = screen.getByPlaceholderText('e.g. 1');
    const labelInput = screen.getByPlaceholderText('e.g. Production Backend Cluster');
    fireEvent.change(apiIdInput, { target: { value: '15' } });
    fireEvent.change(labelInput, { target: { value: 'New Payment Key' } });

    // Submit
    const submitBtn = screen.getByRole('button', { name: 'Tạo Khóa' });
    fireEvent.click(submitBtn);

    // Verify modal reveals the secret
    expect(await screen.findByText('ak_live_SUPER_SECRET_REVEAL_ONCE')).toBeDefined();
    expect(screen.getByText('Khóa API Của Bạn Đã Sẵn Sàng')).toBeDefined();
    expect(createSpy).toHaveBeenCalledWith('15', 'New Payment Key');

    // Verify secret is NEVER persisted to storage
    expect(localSpy).not.toHaveBeenCalledWith(expect.stringMatching(/secret|ak_live/i), expect.anything());
    expect(sessionSpy).not.toHaveBeenCalledWith(expect.stringMatching(/secret|ak_live/i), expect.anything());

    // Close secret modal and verify secret is wiped from DOM
    const closeSecretBtn = screen.getByRole('button', { name: /Tôi đã lưu khóa an toàn/i });
    fireEvent.click(closeSecretBtn);
    await waitFor(() => {
      expect(screen.queryByText('ak_live_SUPER_SECRET_REVEAL_ONCE')).toBeNull();
    });
  });

  it('handles 409 conflict when active key already exists for the API', async () => {
    vi.spyOn(consumerApi, 'listConsumerApiKeys').mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
    });

    vi.spyOn(consumerApi, 'createConsumerApiKey').mockRejectedValueOnce(
      new ApiError(409, 'KEY_CONFLICT', 'An active key already exists for this API')
    );

    render(<ApiKeysPage />);
    expect(await screen.findByText('Chưa có API key nào được cấp phát')).toBeDefined();

    const createBtns = screen.getAllByRole('button', { name: /Create New API Key/i });
    fireEvent.click(createBtns[0]);
    fireEvent.change(screen.getByPlaceholderText('e.g. 1'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /Tạo Khóa/i }));

    expect(await screen.findByText(/Một khóa đang hoạt động đã tồn tại cho API này/)).toBeDefined();
  });

  it('rotates key with immediate revocation warning and displays new secret', async () => {
    vi.spyOn(consumerApi, 'listConsumerApiKeys').mockResolvedValue({
      items: [
        {
          id: '1',
          apiId: '10',
          keyPrefix: 'ak_live_old',
          label: 'My API Key',
          isActive: true,
          lastUsedAt: null,
          revokedAt: null,
          createdAt: '2026-10-26T00:00:00.000Z',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });

    const rotateSpy = vi.spyOn(consumerApi, 'rotateConsumerApiKey').mockResolvedValueOnce({
      id: '2',
      apiId: '10',
      keyPrefix: 'ak_live_new',
      label: 'My API Key',
      isActive: true,
      lastUsedAt: null,
      revokedAt: null,
      createdAt: '2026-10-27T03:00:00.000Z',
      key: 'ak_live_ROTATED_SECRET_KEY',
    });

    render(<ApiKeysPage />);
    expect(await screen.findByText('My API Key')).toBeDefined();

    // Click Rotate
    fireEvent.click(screen.getByRole('button', { name: /Rotate/i }));

    // Confirm warning
    expect(screen.getByText(/Khóa cũ sẽ bị vô hiệu hóa \(revoked\) ngay lập tức/)).toBeDefined();

    // Confirm rotate
    fireEvent.click(screen.getByRole('button', { name: /Xác nhận Rotate/i }));

    // Verifies one-time secret modal opens
    expect(await screen.findByText('ak_live_ROTATED_SECRET_KEY')).toBeDefined();
    expect(rotateSpy).toHaveBeenCalledWith('1');
  });

  it('revokes key with confirmation', async () => {
    vi.spyOn(consumerApi, 'listConsumerApiKeys').mockResolvedValue({
      items: [
        {
          id: '1',
          apiId: '10',
          keyPrefix: 'ak_live_old',
          label: 'To Revoke',
          isActive: true,
          lastUsedAt: null,
          revokedAt: null,
          createdAt: '2026-10-26T00:00:00.000Z',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });

    const revokeSpy = vi.spyOn(consumerApi, 'revokeConsumerApiKey').mockResolvedValueOnce(undefined);

    render(<ApiKeysPage />);
    expect(await screen.findByText('To Revoke')).toBeDefined();

    // Click Revoke
    fireEvent.click(screen.getByRole('button', { name: /Revoke/i }));
    expect(screen.getByText(/Khóa này sẽ bị thu hồi vĩnh viễn/)).toBeDefined();

    // Confirm revoke
    fireEvent.click(screen.getByRole('button', { name: /Xác nhận Thu Hồi/i }));
    await waitFor(() => {
      expect(revokeSpy).toHaveBeenCalledWith('1');
    });
  });
});
