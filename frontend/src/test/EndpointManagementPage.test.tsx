import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EndpointManagementPage } from '../pages/provider/EndpointManagementPage';
import * as providerApiModule from '../services/providerApi';
import type {
  ProviderApi,
  ProviderVersion,
  ProviderEndpoint,
} from '../services/providerTypes';

describe('EndpointManagementPage component tests', () => {
  const mockApis: ProviderApi[] = [
    {
      id: 'api-1',
      providerId: 'prov-1',
      name: 'Weather API',
      description: 'Global forecast',
      category: 'Weather',
      baseUrl: 'https://api.weather.com',
      status: 'Draft',
      tags: ['forecast'],
      createdAt: '2026-10-10T00:00:00Z',
      updatedAt: '2026-10-10T00:00:00Z',
    },
    {
      id: 'api-2',
      providerId: 'prov-1',
      name: 'Payment API',
      description: 'Checkout transactions',
      category: 'Fintech',
      baseUrl: 'https://api.pay.com',
      status: 'Approved',
      tags: ['finance'],
      createdAt: '2026-10-11T00:00:00Z',
      updatedAt: '2026-10-11T00:00:00Z',
    },
  ];

  const mockVersions: ProviderVersion[] = [
    {
      id: 'ver-1',
      apiId: 'api-1',
      version: '1.0.0',
      changelog: 'Initial release',
      createdAt: '2026-10-10T01:00:00Z',
    },
    {
      id: 'ver-2',
      apiId: 'api-1',
      version: '1.1.0',
      changelog: 'Added hourly radar',
      createdAt: '2026-10-12T01:00:00Z',
    },
  ];

  const mockEndpoints: ProviderEndpoint[] = [
    {
      id: 'ep-1',
      apiId: 'api-1',
      versionId: 'ver-1',
      method: 'GET',
      path: '/v1/forecast/current',
      description: 'Fetch current weather',
      parameters: [{ name: 'city', in: 'query', required: true, type: 'string' }],
      requestSchema: null,
      responseExample: { temp: 28 },
      createdAt: '2026-10-10T02:00:00Z',
    },
    {
      id: 'ep-2',
      apiId: 'api-1',
      versionId: 'ver-2',
      method: 'POST',
      path: '/v1/alerts/subscribe',
      description: 'Register webhook for severe weather',
      parameters: [],
      requestSchema: { type: 'object' },
      responseExample: { subscribed: true },
      createdAt: '2026-10-12T02:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading skeleton and displays stale documentation warning banner', async () => {
    vi.spyOn(providerApiModule, 'listProviderApis').mockResolvedValue({
      items: mockApis,
      total: 2,
      page: 1,
      pageSize: 100,
    });
    vi.spyOn(providerApiModule, 'listProviderVersions').mockResolvedValue(mockVersions);
    vi.spyOn(providerApiModule, 'listProviderEndpoints').mockResolvedValue(mockEndpoints);

    render(
      <MemoryRouter initialEntries={['/provider/endpoints?api=api-1']}>
        <EndpointManagementPage />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Loading endpoint page/i)).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText(/Lưu ý về tài liệu OpenAPI:/i)).toBeDefined();
      expect(screen.getByText(/stale documentation/i)).toBeDefined();
    });

    // Check header and API selector
    expect(screen.getByText('Weather API')).toBeDefined();
    expect(screen.getByText(/Quản lý Định tuyến Endpoint|Endpoint Route Management/i)).toBeDefined();
  });

  it('displays versions and endpoints lists with version filter tabs', async () => {
    vi.spyOn(providerApiModule, 'listProviderApis').mockResolvedValue({
      items: mockApis,
      total: 2,
      page: 1,
      pageSize: 100,
    });
    vi.spyOn(providerApiModule, 'listProviderVersions').mockResolvedValue(mockVersions);
    vi.spyOn(providerApiModule, 'listProviderEndpoints').mockResolvedValue(mockEndpoints);

    render(
      <MemoryRouter initialEntries={['/provider/endpoints?api=api-1']}>
        <EndpointManagementPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText(/v1\.0\.0/)[0]).toBeDefined();
      expect(screen.getAllByText(/v1\.1\.0/)[0]).toBeDefined();
    });

    // Both endpoints visible under "Tất cả phiên bản"
    expect(screen.getByText('/v1/forecast/current')).toBeDefined();
    expect(screen.getByText('/v1/alerts/subscribe')).toBeDefined();

    // Click version filter tab v1.0.0
    const v1Tab = screen.getByRole('button', { name: /v1.0.0 \(1\)/i });
    fireEvent.click(v1Tab);

    // v1 endpoint visible, v2 endpoint hidden
    expect(screen.getByText('/v1/forecast/current')).toBeDefined();
    expect(screen.queryByText('/v1/alerts/subscribe')).toBeNull();
  });

  it('creates new API version with valid input', async () => {
    vi.spyOn(providerApiModule, 'listProviderApis').mockResolvedValue({
      items: mockApis,
      total: 2,
      page: 1,
      pageSize: 100,
    });
    vi.spyOn(providerApiModule, 'listProviderVersions').mockResolvedValue(mockVersions);
    vi.spyOn(providerApiModule, 'listProviderEndpoints').mockResolvedValue(mockEndpoints);

    const createVerSpy = vi.spyOn(providerApiModule, 'createProviderVersion').mockResolvedValue({
      id: 'ver-3',
      apiId: 'api-1',
      version: '2.0.0',
      changelog: 'Breaking change release',
      createdAt: '2026-10-16T00:00:00Z',
    });

    render(
      <MemoryRouter initialEntries={['/provider/endpoints?api=api-1']}>
        <EndpointManagementPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText(/v1\.0\.0/)[0]).toBeDefined();
    });

    const addVerBtn = screen.getByRole('button', { name: /Thêm phiên bản mới/i });
    fireEvent.click(addVerBtn);

    expect(screen.getByText('Thêm Phiên bản API mới')).toBeDefined();

    const verInput = screen.getByPlaceholderText(/VD: 1.0.0 hoặc 2.1.0-beta/i);
    const changelogInput = screen.getByPlaceholderText(/Ghi chú các điểm mới/i);

    fireEvent.change(verInput, { target: { value: '2.0.0' } });
    fireEvent.change(changelogInput, { target: { value: 'Breaking change release' } });

    const submitBtn = screen.getByRole('button', { name: /Tạo phiên bản/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(createVerSpy).toHaveBeenCalledWith('api-1', {
        version: '2.0.0',
        changelog: 'Breaking change release',
      });
      expect(screen.getAllByText(/v2\.0\.0/)[0]).toBeDefined();
    });
  });

  it('validates endpoint JSON parameters and creates new endpoint route', async () => {
    vi.spyOn(providerApiModule, 'listProviderApis').mockResolvedValue({
      items: mockApis,
      total: 2,
      page: 1,
      pageSize: 100,
    });
    vi.spyOn(providerApiModule, 'listProviderVersions').mockResolvedValue(mockVersions);
    vi.spyOn(providerApiModule, 'listProviderEndpoints').mockResolvedValue(mockEndpoints);

    const createEpSpy = vi.spyOn(providerApiModule, 'createProviderEndpoint').mockResolvedValue({
      id: 'ep-3',
      apiId: 'api-1',
      versionId: 'ver-1',
      method: 'GET',
      path: '/v1/forecast/history',
      description: 'Historical weather query',
      parameters: [{ name: 'date', in: 'query', required: true, type: 'string' }],
      requestSchema: null,
      responseExample: { history: [] },
      createdAt: '2026-10-16T00:00:00Z',
    });

    render(
      <MemoryRouter initialEntries={['/provider/endpoints?api=api-1']}>
        <EndpointManagementPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Thêm Endpoint Route/i })).toBeDefined();
    });

    fireEvent.click(screen.getByRole('button', { name: /Thêm Endpoint Route/i }));
    expect(screen.getByText('Thêm Endpoint Route Mới')).toBeDefined();

    const pathInput = screen.getByPlaceholderText('/v1/users/profile');
    const descInput = screen.getByPlaceholderText(/Lấy thông tin hồ sơ/i);
    const paramsTextarea = screen.getByPlaceholderText(/\[\{"name": "id"/i);

    // Test invalid JSON parameter error
    fireEvent.change(pathInput, { target: { value: '/v1/forecast/history' } });
    fireEvent.change(descInput, { target: { value: 'Historical weather query' } });
    fireEvent.change(paramsTextarea, { target: { value: 'invalid json' } });

    const submitEpBtn = screen.getByRole('button', { name: /Tạo Endpoint/i });
    fireEvent.click(submitEpBtn);

    await waitFor(() => {
      expect(screen.getByText(/Cú pháp JSON của Parameters không hợp lệ/i)).toBeDefined();
    });

    // Fix parameters JSON with valid Zod strict schema (using schema instead of root type)
    fireEvent.change(paramsTextarea, {
      target: { value: '[{"name": "date", "in": "query", "required": true, "schema": {"type": "string"}}]' },
    });

    fireEvent.click(submitEpBtn);

    await waitFor(() => {
      expect(createEpSpy).toHaveBeenCalledWith('api-1', {
        versionId: 'ver-1',
        method: 'GET',
        path: '/v1/forecast/history',
        description: 'Historical weather query',
        parameters: [{ name: 'date', in: 'query', required: true, schema: { type: 'string' } }],
        requestSchema: null,
        responseExample: { status: 'success' },
      });
      expect(screen.getByText('/v1/forecast/history')).toBeDefined();
    });
  });

  it('deletes endpoint with confirmation modal', async () => {
    vi.spyOn(providerApiModule, 'listProviderApis').mockResolvedValue({
      items: mockApis,
      total: 2,
      page: 1,
      pageSize: 100,
    });
    vi.spyOn(providerApiModule, 'listProviderVersions').mockResolvedValue(mockVersions);
    vi.spyOn(providerApiModule, 'listProviderEndpoints').mockResolvedValue(mockEndpoints);

    const deleteEpSpy = vi.spyOn(providerApiModule, 'deleteProviderEndpoint').mockResolvedValue();

    render(
      <MemoryRouter initialEntries={['/provider/endpoints?api=api-1']}>
        <EndpointManagementPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('/v1/forecast/current')).toBeDefined();
    });

    // Find and click delete button for first endpoint
    const deleteBtns = screen.getAllByTitle('Xóa Endpoint');
    fireEvent.click(deleteBtns[0]);

    expect(screen.getByText('Xác nhận xóa Endpoint')).toBeDefined();
    const confirmDeleteBtn = screen.getByRole('button', { name: /Xác nhận xóa/i });
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(deleteEpSpy).toHaveBeenCalledWith('api-1', 'ep-1');
      expect(screen.queryByText('/v1/forecast/current')).toBeNull();
    });
  });
});
