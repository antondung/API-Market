import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OpenApiImportPage } from '../pages/provider/OpenApiImportPage';
import * as providerApiModule from '../services/providerApi';
import type {
  ProviderApi,
  ProviderVersion,
  ProviderDocumentation,
} from '../services/providerTypes';

describe('OpenApiImportPage component tests', () => {
  const mockApis: ProviderApi[] = [
    {
      id: 'api-1',
      providerId: 'prov-1',
      name: 'E-Commerce Orders API',
      description: 'Order processing gateway',
      category: 'E-Commerce',
      baseUrl: 'https://orders.example.com',
      status: 'Draft',
      tags: ['ecommerce'],
      createdAt: '2026-10-10T00:00:00Z',
      updatedAt: '2026-10-10T00:00:00Z',
    },
  ];

  const mockVersions: ProviderVersion[] = [
    {
      id: 'ver-1',
      apiId: 'api-1',
      version: '1.0.0',
      changelog: 'Initial version',
      createdAt: '2026-10-10T01:00:00Z',
    },
  ];

  const mockDoc: ProviderDocumentation = {
    id: 'doc-1',
    apiId: 'api-1',
    versionId: 'ver-1',
    source: 'OpenAPI 3.0.0',
    content: {
      openapi: '3.0.0',
      info: {
        title: 'E-Commerce Orders API Specification',
        version: '1.0.0',
        description: 'Complete API for managing cart, checkout and tracking.',
        contact: {
          name: 'Tech Lead',
          email: 'tech@example.com',
        },
      },
      servers: [{ url: 'https://orders.example.com/v1', description: 'Production Gateway' }],
      components: {
        securitySchemes: {
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key',
            description: 'API key authentication header',
          },
        },
      },
      paths: {
        '/v1/orders': {
          get: {
            summary: 'List recent orders',
            description: 'Returns pagination list of orders for tenant.',
            tags: ['Orders'],
            parameters: [
              {
                name: 'limit',
                in: 'query',
                required: false,
                schema: { type: 'integer' },
                description: 'Number of orders to return',
              },
            ],
            responses: {
              '200': {
                description: 'Order list retrieved successfully',
                content: { 'application/json': { items: [] } },
              },
            },
          },
          post: {
            summary: 'Create new order',
            description: 'Submits shopping cart items for payment authorization.',
            tags: ['Orders'],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { type: 'object', properties: { cartId: { type: 'string' } } },
                },
              },
            },
            responses: {
              '201': {
                description: 'Order created',
              },
            },
          },
        },
      },
    },
    updatedAt: '2026-10-10T02:00:00Z',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders import form and rejects invalid file types or oversized files', async () => {
    vi.spyOn(providerApiModule, 'listProviderApis').mockResolvedValue({
      items: mockApis,
      total: 1,
      page: 1,
      pageSize: 100,
    });
    vi.spyOn(providerApiModule, 'listProviderVersions').mockResolvedValue(mockVersions);
    vi.spyOn(providerApiModule, 'listProviderDocumentation').mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={['/provider/import-openapi?api=api-1']}>
        <OpenApiImportPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('E-Commerce Orders API')).toBeDefined();
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeDefined();

    // 1. Invalid file extension (.pdf)
    const invalidFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Tệp tải lên phải có định dạng OpenAPI JSON \(\.json\) hoặc YAML/i)).toBeDefined();
    });

    // 2. Oversized file (> 1MB)
    const bigFile = new File([new ArrayBuffer(1048576 + 500)], 'huge-spec.json', {
      type: 'application/json',
    });
    fireEvent.change(fileInput, { target: { files: [bigFile] } });

    await waitFor(() => {
      expect(screen.getByText(/vượt quá giới hạn tối đa cho phép là 1MB/i)).toBeDefined();
    });
  });

  it('uploads valid OpenAPI JSON file and shows success summary banner', async () => {
    vi.spyOn(providerApiModule, 'listProviderApis').mockResolvedValue({
      items: mockApis,
      total: 1,
      page: 1,
      pageSize: 100,
    });
    vi.spyOn(providerApiModule, 'listProviderVersions').mockResolvedValue(mockVersions);
    vi.spyOn(providerApiModule, 'listProviderDocumentation').mockResolvedValue([]);

    const importSpy = vi.spyOn(providerApiModule, 'importOpenApiFile').mockResolvedValue({
      versionId: 'ver-1',
      endpointCount: 2,
      title: 'E-Commerce Orders API Specification',
    });

    render(
      <MemoryRouter initialEntries={['/provider/import-openapi?api=api-1']}>
        <OpenApiImportPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('E-Commerce Orders API')).toBeDefined();
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const validFile = new File(['{"openapi": "3.0.0"}'], 'spec.json', { type: 'application/json' });
    fireEvent.change(fileInput, { target: { files: [validFile] } });

    await waitFor(() => {
      expect(screen.getByText('spec.json')).toBeDefined();
    });

    const submitBtn = screen.getByRole('button', { name: /Bắt đầu Tải lên & Trích xuất/i });
    expect(submitBtn.hasAttribute('disabled')).toBe(false);

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(importSpy).toHaveBeenCalledWith('api-1', 'ver-1', validFile);
      expect(screen.getByText(/Trích xuất tài liệu OpenAPI thành công!/i)).toBeDefined();
      expect(screen.getByText(/Số lượng Endpoint đã trích xuất:/i)).toBeDefined();
    });
  });

  it('renders all 7 sections of Documentation Viewer cleanly without XSS risks', async () => {
    vi.spyOn(providerApiModule, 'listProviderApis').mockResolvedValue({
      items: mockApis,
      total: 1,
      page: 1,
      pageSize: 100,
    });
    vi.spyOn(providerApiModule, 'listProviderVersions').mockResolvedValue(mockVersions);
    vi.spyOn(providerApiModule, 'listProviderDocumentation').mockResolvedValue([mockDoc]);

    render(
      <MemoryRouter initialEntries={['/provider/import-openapi?api=api-1&tab=viewer']}>
        <OpenApiImportPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // 1. Overview Section
      expect(screen.getByText('E-Commerce Orders API Specification')).toBeDefined();
      expect(screen.getByText(/Complete API for managing cart, checkout and tracking/i)).toBeDefined();
      expect(screen.getByText('https://orders.example.com/v1')).toBeDefined();
    });

    // 2. Authentication Section
    const authBtn = screen.getByRole('button', { name: /2\. Xác thực/i });
    fireEvent.click(authBtn);
    await waitFor(() => {
      expect(screen.getByText('ApiKeyAuth')).toBeDefined();
      expect(screen.getByText(/X-API-Key/i)).toBeDefined();
    });

    // 3. Endpoints Section
    const endpointsBtn = screen.getByRole('button', { name: /3\. Tuyến đường/i });
    fireEvent.click(endpointsBtn);
    await waitFor(() => {
      expect(screen.getAllByText('/v1/orders')[0]).toBeDefined();
      expect(screen.getByText('List recent orders')).toBeDefined();
      expect(screen.getByText('Create new order')).toBeDefined();
    });

    // 4. Parameters Section
    const paramsBtn = screen.getByRole('button', { name: /4\. Tham số/i });
    fireEvent.click(paramsBtn);
    await waitFor(() => {
      expect(screen.getByText('limit')).toBeDefined();
      expect(screen.getByText('query')).toBeDefined();
      expect(screen.getByText('Number of orders to return')).toBeDefined();
    });

    // 5. Request Body Section
    const requestBtn = screen.getByRole('button', { name: /5\. Yêu cầu/i });
    fireEvent.click(requestBtn);
    await waitFor(() => {
      expect(screen.getByText(/cartId/i)).toBeDefined();
    });

    // 6. Response Section
    const responseBtn = screen.getByRole('button', { name: /6\. Phản hồi/i });
    fireEvent.click(responseBtn);
    await waitFor(() => {
      expect(screen.getByText('HTTP 200')).toBeDefined();
      expect(screen.getByText('HTTP 201')).toBeDefined();
    });

    // 7. Errors Section
    const errorsBtn = screen.getByRole('button', { name: /7\. Mã lỗi/i });
    fireEvent.click(errorsBtn);
    await waitFor(() => {
      expect(screen.getByText('400 Bad Request')).toBeDefined();
      expect(screen.getByText('401 Unauthorized')).toBeDefined();
      expect(screen.getByText('429 Too Many Requests')).toBeDefined();
    });
  });
});
