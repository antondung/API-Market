export interface MarketplaceApiSummary {
  id: string;
  name: string;
  description: string;
  category: string;
  providerId: string;
  providerName: string;
  providerStatus: 'Verified' | 'Pending' | 'Suspended' | 'Unverified';
  tags: string[];
  hasFreePlan: boolean;
  hasPaidPlan: boolean;
  publishedAt: string;
}

export interface MarketplaceVersion {
  id: string;
  version: string;
  changelog: string;
  publishedAt?: string;
}

export interface MarketplaceEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  parameters?: Array<{
    name: string;
    in: 'query' | 'header' | 'path';
    required: boolean;
    schema?: { type?: string };
  }>;
  requestBody?: {
    contentType: string;
    schema?: any;
  };
  responses?: Record<string, { description: string }>;
}

export interface MarketplaceDocumentation {
  id: string;
  title: string;
  content: string;
  orderIndex?: number;
}

export interface MarketplacePricingPlan {
  id: string;
  name: string;
  priceMonthly: number;
  currency: string;
  quota: number;
  rateLimit: number;
  recommended?: boolean;
}

export interface MarketplaceLegal {
  privacyPolicyUrl?: string | null;
  termsOfServiceUrl?: string | null;
  processesPersonalData?: boolean | null;
  slaPercentage?: number | null;
}

export interface MarketplaceApiDetail extends MarketplaceApiSummary {
  versions: MarketplaceVersion[];
  endpoints: MarketplaceEndpoint[];
  documentation: MarketplaceDocumentation[];
  legal: MarketplaceLegal | null;
  plans: MarketplacePricingPlan[];
  swaggerUrl?: string | null;
}

export interface MarketplacePaginatedResponse {
  items: MarketplaceApiSummary[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Standard primary mock API detail: Payment Engine
 */
export const mockPaymentApiDetail: MarketplaceApiDetail = {
  id: '1',
  name: 'Cloud Payment Engine',
  description: 'Cổng định tuyến thanh toán tốc độ cao, hỗ trợ QR Code, thẻ nội địa và thẻ quốc tế.',
  category: 'Financial',
  providerId: 'prov-fintech-101',
  providerName: 'FinTech Vietnam Solutions',
  providerStatus: 'Verified',
  tags: ['finance', 'payment', 'vietqr', 'banking'],
  hasFreePlan: true,
  hasPaidPlan: true,
  publishedAt: '2026-10-15T08:00:00Z',
  versions: [
    {
      id: 'ver-1-0-0',
      version: '1.0.0',
      changelog: 'Phiên bản khởi tạo hỗ trợ thanh toán QR và tra cứu giao dịch.',
      publishedAt: '2026-08-01T00:00:00Z',
    },
    {
      id: 'ver-1-1-0',
      version: '1.1.0',
      changelog: 'Bổ sung endpoint đối soát hàng loạt và tra cứu webhook.',
      publishedAt: '2026-09-10T00:00:00Z',
    },
    {
      id: 'ver-2-0-0',
      version: '2.0.0',
      changelog: 'Kiến trúc v2 đa tiền tệ, nâng cấp chuẩn bảo mật PCI-DSS.',
      publishedAt: '2026-10-15T00:00:00Z',
    },
  ],
  endpoints: [
    {
      id: 'ep-get-transactions',
      method: 'GET',
      path: '/v1/transactions',
      description: 'Danh sách giao dịch thanh toán trong kỳ',
      parameters: [
        { name: 'limit', in: 'query', required: false, schema: { type: 'integer' } },
        { name: 'status', in: 'query', required: false, schema: { type: 'string' } },
        { name: 'X-API-Key', in: 'header', required: true, schema: { type: 'string' } },
      ],
      responses: {
        '200': { description: 'Danh sách giao dịch' },
        '401': { description: 'Chưa xác thực' },
      },
    },
    {
      id: 'ep-create-payment',
      method: 'POST',
      path: '/v1/payments/create',
      description: 'Tạo yêu cầu thanh toán mới và sinh mã VietQR động',
      parameters: [
        { name: 'X-API-Key', in: 'header', required: true, schema: { type: 'string' } },
      ],
      requestBody: {
        contentType: 'application/json',
        schema: {
          type: 'object',
          properties: {
            amount: { type: 'number' },
            orderId: { type: 'string' },
            description: { type: 'string' },
          },
          required: ['amount', 'orderId'],
        },
      },
      responses: {
        '201': { description: 'Tạo mã thanh toán thành công' },
        '400': { description: 'Tham số không hợp lệ' },
      },
    },
    {
      id: 'ep-cancel-payment',
      method: 'DELETE',
      path: '/v1/payments/{paymentId}',
      description: 'Hủy đơn hàng chờ thanh toán',
      parameters: [
        { name: 'paymentId', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'X-API-Key', in: 'header', required: true, schema: { type: 'string' } },
      ],
      responses: {
        '200': { description: 'Hủy thành công' },
        '404': { description: 'Không tìm thấy đơn hàng' },
      },
    },
  ],
  documentation: [
    {
      id: 'doc-overview',
      title: 'Tổng quan & Bắt đầu nhanh',
      content: '# Hướng dẫn tích hợp Cloud Payment Engine\n\nAPI cung cấp khả năng tích hợp thanh toán tức thời với hạ tầng Gateway chuẩn PCI-DSS.',
      orderIndex: 1,
    },
    {
      id: 'doc-auth',
      title: 'Xác thực & Mã lỗi',
      content: 'Mọi request yêu cầu header `X-API-Key`. Hãy bảo mật khóa bí mật trong môi trường backend.',
      orderIndex: 2,
    },
  ],
  legal: {
    privacyPolicyUrl: 'https://fintech.example.vn/privacy',
    termsOfServiceUrl: 'https://fintech.example.vn/terms',
    processesPersonalData: true,
    slaPercentage: 99.95,
  },
  plans: [
    {
      id: 'plan-free-1',
      name: 'Starter Developer',
      priceMonthly: 0,
      currency: 'VND',
      quota: 1000,
      rateLimit: 5,
      recommended: false,
    },
    {
      id: 'plan-pro-1',
      name: 'Pro Business Tier',
      priceMonthly: 500000,
      currency: 'VND',
      quota: 50000,
      rateLimit: 50,
      recommended: true,
    },
    {
      id: 'plan-ent-1',
      name: 'Enterprise Scale',
      priceMonthly: 5000000,
      currency: 'VND',
      quota: 1000000,
      rateLimit: 500,
      recommended: false,
    },
  ],
};

/**
 * Secondary mock API detail: AI Vision API (No Personal Data Processing)
 */
export const mockAiVisionApiDetail: MarketplaceApiDetail = {
  id: '2',
  name: 'Neural Vision OCR & Object Detection',
  description: 'Trích xuất văn bản hóa đơn, nhận diện đối tượng ảnh độ chính xác cao bằng deep learning.',
  category: 'AI / Machine Learning',
  providerId: 'prov-ai-labs-202',
  providerName: 'DeepVision AI Labs',
  providerStatus: 'Verified',
  tags: ['ai', 'vision', 'ocr', 'deep-learning'],
  hasFreePlan: true,
  hasPaidPlan: true,
  publishedAt: '2026-10-18T10:00:00Z',
  versions: [
    { id: 'ver-v1', version: '1.0.0', changelog: 'Phiên bản khởi tạo OCR hóa đơn' },
    { id: 'ver-v2', version: '2.0.0', changelog: 'Tích hợp mô hình nhận diện thực thể ảnh mới' },
  ],
  endpoints: [
    {
      id: 'ep-ocr-analyze',
      method: 'POST',
      path: '/v1/vision/ocr',
      description: 'Phân tích và bóc tách chữ từ ảnh base64 hoặc URL',
      parameters: [{ name: 'X-API-Key', in: 'header', required: true }],
      requestBody: {
        contentType: 'application/json',
        schema: { type: 'object', properties: { imageUrl: { type: 'string' } } },
      },
    },
  ],
  documentation: [
    {
      id: 'doc-ai-quickstart',
      title: 'Giới thiệu Vision Model',
      content: 'Nhận diện hình ảnh thời gian thực dưới 150ms.',
    },
  ],
  legal: {
    privacyPolicyUrl: 'https://vision.ai.vn/privacy',
    termsOfServiceUrl: null,
    processesPersonalData: false, // Explicitly false
    slaPercentage: 99.9,
  },
  plans: [
    {
      id: 'plan-ai-free',
      name: 'AI Hobbyist',
      priceMonthly: 0,
      currency: 'VND',
      quota: 500,
      rateLimit: 2,
    },
    {
      id: 'plan-ai-pro',
      name: 'AI Commercial',
      priceMonthly: 1200000,
      currency: 'VND',
      quota: 100000,
      rateLimit: 100,
    },
  ],
};

/**
 * Third mock API detail: Unknown Legal Metadata (processesPersonalData is null)
 */
export const mockUnannouncedLegalApiDetail: MarketplaceApiDetail = {
  id: '3',
  name: 'Vietnam Routing & Geo Matrix',
  description: 'Tính toán đường đi, tối ưu hóa cung đường giao hàng chặng cuối cho logistics.',
  category: 'Maps & Navigation',
  providerId: 'prov-logistics-303',
  providerName: 'SmartLog GeoTech',
  providerStatus: 'Pending',
  tags: ['logistics', 'maps', 'routing', 'vietnam'],
  hasFreePlan: false,
  hasPaidPlan: true,
  publishedAt: '2026-10-22T14:30:00Z',
  versions: [{ id: 'ver-geo-1', version: '1.0.0', changelog: 'Bản đồ số Việt Nam' }],
  endpoints: [
    {
      id: 'ep-route-calc',
      method: 'GET',
      path: '/v1/route/calculate',
      description: 'Tính đường đi tối ưu giữa 2 điểm',
    },
  ],
  documentation: [], // Empty documentation scenario
  legal: {
    privacyPolicyUrl: null,
    termsOfServiceUrl: null,
    processesPersonalData: null, // UNANNOUNCED (null)
    slaPercentage: null,
  },
  plans: [
    {
      id: 'plan-geo-pro',
      name: 'Logistics Fleet',
      priceMonthly: 850000,
      currency: 'VND',
      quota: 20000,
      rateLimit: 30,
    },
  ],
};

/**
 * Generator for catalog of any arbitrary size N
 */
export function generateMockCatalog(count: number): MarketplaceApiSummary[] {
  const categories = [
    'Financial',
    'AI / Machine Learning',
    'E-Commerce',
    'Maps & Navigation',
    'Security & Auth',
    'Cloud Services',
    'Communication',
    'Healthcare',
  ];

  const providers = [
    { id: 'p1', name: 'FinTech Vietnam Solutions', status: 'Verified' as const },
    { id: 'p2', name: 'DeepVision AI Labs', status: 'Verified' as const },
    { id: 'p3', name: 'SmartLog GeoTech', status: 'Pending' as const },
    { id: 'p4', name: 'SecureAuth Identity', status: 'Verified' as const },
    { id: 'p5', name: 'OpenCommerce Services', status: 'Unverified' as const },
  ];

  const apis: MarketplaceApiSummary[] = [];

  for (let i = 1; i <= count; i++) {
    const cat = categories[(i - 1) % categories.length];
    const prov = providers[(i - 1) % providers.length];
    const hasFree = i % 2 === 1;
    const hasPaid = i % 3 !== 0;

    apis.push({
      id: String(i),
      name: `Dịch vụ API ${cat} Hệ thống ${i}`,
      description: `Mô tả giải pháp cho API ${cat} số ${i}, cung cấp hiệu năng cao và độ trễ thấp trên Gateway.`,
      category: cat,
      providerId: prov.id,
      providerName: prov.name,
      providerStatus: prov.status,
      tags: [cat.toLowerCase().replace(/[^a-z0-9]/g, '-'), 'api', `v${(i % 3) + 1}`],
      hasFreePlan: hasFree,
      hasPaidPlan: hasPaid,
      publishedAt: new Date(1760000000000 - i * 86400000).toISOString(),
    });
  }

  return apis;
}

export const catalogZero: MarketplaceApiSummary[] = [];
export const catalogOne: MarketplaceApiSummary[] = generateMockCatalog(1);
export const catalogTwelve: MarketplaceApiSummary[] = generateMockCatalog(12);
export const catalogThirteen: MarketplaceApiSummary[] = generateMockCatalog(13);
export const catalogFifty: MarketplaceApiSummary[] = generateMockCatalog(50);
export const catalogSixtyFive: MarketplaceApiSummary[] = generateMockCatalog(65);
export const catalogOneHundredTwenty: MarketplaceApiSummary[] = generateMockCatalog(120);
export const catalogTwoHundredFifty: MarketplaceApiSummary[] = generateMockCatalog(250);
