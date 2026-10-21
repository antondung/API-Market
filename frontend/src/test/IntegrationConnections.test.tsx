import React from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import * as Auth from '../context/AuthContext';
import * as AppContext from '../context/AppContext';
import * as providerApi from '../services/providerApi';
import { ProviderDashboardPage } from '../pages/provider/ProviderDashboardPage';
import { MarketplacePage } from '../pages/marketplace/MarketplacePage';
import { ApiDetailPage } from '../pages/marketplace/ApiDetailPage';
import { ApiPlaygroundPage } from '../pages/marketplace/ApiPlaygroundPage';
import { CheckoutPage } from '../pages/checkout/CheckoutPage';
import { GatewayOperationsPage } from '../pages/admin/GatewayOperationsPage';
import { TrySandboxPage } from '../pages/marketplace/TrySandboxPage';
import { PricingPage } from '../pages/marketplace/PricingPage';
import { CompareApisPage } from '../pages/marketplace/CompareApisPage';
import type { User, ApiItem } from '../types';
import type { ProviderApi, ProviderVerification } from '../services/providerTypes';

vi.mock('../i18n', () => ({ useLanguage: () => ({ t: (value: string) => value }) }));
const user = { id: '1', name: 'Provider', role: 'API_PROVIDER' } as User;
let currentUser: User | null = user;
const backendApi = { id: '100', providerId: '900', name: 'Real DB API', category: 'Weather', status: 'Draft' } as ProviderApi;
const verification = { providerId: '900', organizationName: 'Verified company', status: 'Verified' } as ProviderVerification;
const cachedApi: ApiItem = { id: '1', name: 'Published cached API', slug: 'local', providerId: '900', providerName: 'Provider',
  providerVerified: true, category: 'Weather & Geo', shortDescription: 'Local record', longDescription: 'Local record',
  icon: 'cloud', status: 'Published', version: '1.0', baseUrl: 'https://example.com', rating: 0, reviewCount: 0,
  latencyP95Ms: 0, uptimePercent: 100, subscribersCount: 0, totalCallsMonthly: '0', tags: [],
  endpoints: [{ id: 'e1', path: '/weather', method: 'GET', summary: 'Weather', description: 'Weather', rateLimitPerSec: 10, parameters: [], sampleResponse: '{}' }],
  plans: [{ id: 'p1', apiId: '1', name: 'Free', tier: 'Free', priceMonthly: 0, monthlyQuota: 100, rateLimitPerSec: 10, features: [] }],
  legalDeclarationCompleted: true };

beforeEach(() => {
  vi.restoreAllMocks(); currentUser = user;
  vi.spyOn(Auth, 'useAuth').mockImplementation(() => ({ currentUser, user: currentUser, isAuthenticated: Boolean(currentUser), sessionReady: true }) as any);
  vi.spyOn(providerApi, 'getProviderVerification').mockResolvedValue(verification);
  vi.spyOn(providerApi, 'listProviderApis').mockResolvedValue({ items: [backendApi], total: 17, page: 1, pageSize: 5 });
});
const Location = () => <output data-testid="location">{useLocation().pathname}</output>;
const view = (path: string, pattern: string, page: React.ReactNode) => <MemoryRouter initialEntries={[path]}>
  <AppContext.AppProvider><Location /><Routes><Route path={pattern} element={page} /><Route path="*" element={<p>Destination</p>} /></Routes></AppContext.AppProvider>
</MemoryRouter>;
const cache = (apis: ApiItem[]) => vi.spyOn(AppContext, 'useApp').mockReturnValue({ apis } as any);

it('Provider dashboard reads real verification and API data, preserving provider/profile ID distinction', async () => {
  render(view('/provider', '/provider', <ProviderDashboardPage />));
  expect(screen.queryByText('Chưa xác minh')).toBeNull();
  expect(screen.getByRole('button', { name: /Create API Product/ }).hasAttribute('disabled')).toBe(true);
  await screen.findByText('Real DB API');
  expect(screen.getByText('Verified')).toBeDefined();
  expect(screen.getByText('17')).toBeDefined();
  expect(providerApi.listProviderApis).toHaveBeenCalledWith(1, 5, expect.any(AbortSignal));
  fireEvent.click(screen.getByRole('button', { name: /Create API Product/ }));
  expect(screen.getByTestId('location').textContent).toBe('/provider/create-api');
});

it('Verified provider can navigate to real OpenAPI import page', async () => {
  render(view('/provider', '/provider', <ProviderDashboardPage />));
  await screen.findByText('Real DB API');
  fireEvent.click(screen.getByRole('button', { name: /Import OpenAPI/ }));
  expect(screen.getByTestId('location').textContent).toBe('/provider/import-openapi');
});

it.each([null, 'Pending', 'Rejected'] as const)('Provider status %s cannot create API', async status => {
  vi.mocked(providerApi.getProviderVerification).mockResolvedValue(status ? { ...verification, status } : null);
  render(view('/provider', '/provider', <ProviderDashboardPage />));
  await screen.findByText('Real DB API');
  expect(screen.getByRole('button', { name: /Create API Product/ }).hasAttribute('disabled')).toBe(true);
});

it('Dashboard distinguishes a failed read from unverified and retries without mock fallback', async () => {
  vi.mocked(providerApi.getProviderVerification).mockRejectedValueOnce(new Error('Network down'));
  render(view('/provider', '/provider', <ProviderDashboardPage />));
  await screen.findByRole('alert');
  expect(screen.queryByText('Chưa xác minh')).toBeNull();
  expect(screen.getByRole('button', { name: /Create API Product/ }).hasAttribute('disabled')).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Làm mới' }));
  await screen.findByText('Verified');
  expect(screen.queryByRole('alert')).toBeNull();
});

it('Dashboard refreshes when returning to the browser tab', async () => {
  render(view('/provider', '/provider', <ProviderDashboardPage />));
  await screen.findByText('Real DB API');
  vi.mocked(providerApi.listProviderApis).mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 5 });
  fireEvent(window, new Event('focus'));
  await screen.findByText('Bạn chưa có API nào.');
  expect(screen.queryByText('Real DB API')).toBeNull();
});

it('Late replies from the previous account cannot overwrite the current dashboard', async () => {
  let resolveOld!: (value: ProviderVerification) => void;
  vi.mocked(providerApi.getProviderVerification).mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; }));
  const result = render(view('/provider', '/provider', <ProviderDashboardPage />));
  currentUser = { ...user, id: '2' };
  vi.mocked(providerApi.listProviderApis).mockResolvedValue({ items: [{ ...backendApi, name: 'New account API' }], total: 1, page: 1, pageSize: 5 });
  result.rerender(view('/provider', '/provider', <ProviderDashboardPage />));
  await screen.findByText('New account API');
  await act(async () => { resolveOld({ ...verification, status: 'Rejected' }); });
  expect(screen.getByText('Verified')).toBeDefined();
  expect(screen.queryByText('Real DB API')).toBeNull();
  currentUser = null;
  result.rerender(view('/provider', '/provider', <ProviderDashboardPage />));
  expect(screen.queryByText('New account API')).toBeNull();
  expect(screen.getByRole('button', { name: /Create API Product/ }).hasAttribute('disabled')).toBe(true);
});

it.each([
  ['/checkout/1/p1', '/checkout/:apiId/:planId', <CheckoutPage key="checkout" />],
  ['/api/1/playground', '/api/:id/playground', <ApiPlaygroundPage key="playground" />],
])('Clean browser route %s renders unavailable instead of crashing', (path, pattern, page) => {
  render(view(path, pattern, page));
  expect(screen.getByText('API hoặc gói dịch vụ không khả dụng')).toBeDefined();
});

it.each(['/checkout/missing/p1', '/checkout/1/missing'])('Checkout rejects an unknown API/plan at %s', path => {
  cache([cachedApi]);
  render(view(path, '/checkout/:apiId/:planId', <CheckoutPage />));
  expect(screen.getByText('API hoặc gói dịch vụ không khả dụng')).toBeDefined();
  expect(screen.queryByText(cachedApi.name)).toBeNull();
});

it('Checkout requires login and cannot create a local subscription pretending to be a backend transaction', () => {
  const subscribe = vi.fn();
  vi.spyOn(AppContext, 'useApp').mockReturnValue({ apis: [cachedApi], subscribeToPlan: subscribe } as any);
  currentUser = null;
  const result = render(view('/checkout/1/p1', '/checkout/:apiId/:planId', <CheckoutPage />));
  expect(screen.getByRole('link', { name: 'Đăng nhập' })).toBeDefined();
  currentUser = user;
  result.rerender(view('/checkout/1/p1', '/checkout/:apiId/:planId', <CheckoutPage />));
  const activate = screen.getByRole('button', { name: /Activate Free Sandbox Tier/ });
  expect(activate.hasAttribute('disabled')).toBe(true);
  fireEvent.click(activate);
  expect(subscribe).not.toHaveBeenCalled();
});

it.each([
  ['/api/1', '/api/:id', <ApiDetailPage key="detail" />],
  ['/api/1/playground', '/api/:id/playground', <ApiPlaygroundPage key="playground" />],
  ['/api/1/try-sandbox', '/api/:id/try-sandbox', <TrySandboxPage key="sandbox" />],
  ['/checkout/1/p1', '/checkout/:apiId/:planId', <CheckoutPage key="checkout" />],
  ['/marketplace', '/marketplace', <MarketplacePage key="marketplace" />],
  ['/pricing', '/pricing', <PricingPage key="pricing" />],
  ['/compare', '/compare', <CompareApisPage key="compare" />],
])('Public route %s does not expose a cached Draft', (path, pattern, page) => {
  cache([{ ...cachedApi, status: 'Draft', name: 'Private draft' }]);
  render(view(path, pattern, page));
  expect(screen.queryByText('Private draft')).toBeNull();
});

it('Playground rejects an unknown API instead of substituting a cached API', () => {
  cache([cachedApi]);
  render(view('/api/missing/playground', '/api/:id/playground', <ApiPlaygroundPage />));
  expect(screen.getByText('API hoặc gói dịch vụ không khả dụng')).toBeDefined();
});

it('Playground explains the missing backend and does not send simulated requests', () => {
  const execute = vi.fn();
  vi.spyOn(AppContext, 'useApp').mockReturnValue({ apis: [cachedApi], apiKeys: [], executeGatewayCall: execute } as any);
  render(view('/api/1/playground', '/api/:id/playground', <ApiPlaygroundPage />));
  const send = screen.getByRole('button', { name: /Send Request/ });
  expect(send.hasAttribute('disabled')).toBe(true);
  fireEvent.click(send);
  expect(execute).not.toHaveBeenCalled();
});

it('Admin monitoring reports unknown rather than unmeasured health/latency/worker activity', async () => {
  render(view('/admin/gateway', '/admin/gateway', <GatewayOperationsPage />));
  expect(screen.getAllByText('Chưa có dữ liệu giám sát')).toHaveLength(5);
  await waitFor(() => expect(screen.queryByText(/100% OK|Ready for production|Active daemon|< 2 ms/)).toBeNull());
});
