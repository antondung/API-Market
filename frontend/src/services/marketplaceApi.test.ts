import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildMarketplaceSearchParams,
  listMarketplaceApis,
  getMarketplaceApiDetail,
  formatPrice,
  formatPublishedDate,
} from './marketplaceApi';
import * as authApiModule from './authApi';
import { ApiError } from './authApi';
import type { MarketplaceApiDetail, MarketplacePaginatedResponse } from './marketplaceTypes';

describe('marketplaceApi', () => {
  describe('buildMarketplaceSearchParams', () => {
    it('returns empty params for empty query object', () => {
      const params = buildMarketplaceSearchParams({});
      expect(params.toString()).toBe('');
    });

    it('sets query string correctly and trims values', () => {
      const params = buildMarketplaceSearchParams({
        q: '  weather  ',
        category: 'Finance',
        tag: 'crypto',
        providerId: '42',
        pricing: 'free',
        sort: 'name',
        page: 2,
        pageSize: 50,
      });

      expect(params.get('q')).toBe('weather');
      expect(params.get('category')).toBe('Finance');
      expect(params.get('tag')).toBe('crypto');
      expect(params.get('providerId')).toBe('42');
      expect(params.get('pricing')).toBe('free');
      expect(params.get('sort')).toBe('name');
      expect(params.get('page')).toBe('2');
      expect(params.get('pageSize')).toBe('50');
    });

    it('ignores "All" category and empty search query', () => {
      const params = buildMarketplaceSearchParams({
        q: '   ',
        category: 'All',
        pricing: undefined,
      });

      expect(params.has('q')).toBe(false);
      expect(params.has('category')).toBe(false);
      expect(params.has('pricing')).toBe(false);
    });

    it('ignores invalid or out-of-range providerId, page and pageSize', () => {
      const params = buildMarketplaceSearchParams({
        providerId: 'not-a-number',
        page: 0,
        pageSize: 200,
      });

      expect(params.has('providerId')).toBe(false);
      expect(params.has('page')).toBe(false);
      expect(params.has('pageSize')).toBe(false);
    });

    it('omits default page=1 and pageSize=20 to keep query concise', () => {
      const params = buildMarketplaceSearchParams({
        page: 1,
        pageSize: 20,
      });

      expect(params.has('page')).toBe(false);
      expect(params.has('pageSize')).toBe(false);
    });

    it('ignores inputs containing NUL characters', () => {
      const params = buildMarketplaceSearchParams({
        q: 'weather\0inject',
        category: 'Data\0leak',
        tag: 'tag\0fail',
      });

      expect(params.has('q')).toBe(false);
      expect(params.has('category')).toBe(false);
      expect(params.has('tag')).toBe(false);
    });
  });

  describe('listMarketplaceApis', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('calls apiRequest with correct path and query parameters', async () => {
      const mockResponse: MarketplacePaginatedResponse = {
        items: [
          {
            id: '1',
            name: 'Weather API',
            description: 'Forecast data',
            category: 'Weather',
            tags: ['weather'],
            publishedAt: '2026-10-21T00:00:00.000Z',
            providerId: '1',
            providerName: 'Weather Corp',
            providerStatus: 'Verified',
            hasFreePlan: true,
            hasPaidPlan: true,
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      };

      const spy = vi.spyOn(authApiModule, 'apiRequest').mockResolvedValueOnce({ data: mockResponse });

      const result = await listMarketplaceApis({ q: 'weather', sort: 'newest' });

      expect(spy).toHaveBeenCalledWith('/api/marketplace/apis?q=weather&sort=newest', {
        method: 'GET',
        signal: undefined,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getMarketplaceApiDetail', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('fetches detail for a valid numeric id', async () => {
      const mockDetail: MarketplaceApiDetail = {
        id: '1',
        name: 'Weather API',
        description: 'Forecast data',
        category: 'Weather',
        tags: ['weather'],
        publishedAt: '2026-10-21T00:00:00.000Z',
        providerId: '1',
        providerName: 'Weather Corp',
        providerStatus: 'Verified',
        hasFreePlan: true,
        hasPaidPlan: true,
        versions: [{ id: '1', version: '1.0.0', changelog: 'Initial' }],
        endpoints: [],
        documentation: [],
        plans: [{ id: '1', name: 'Free', priceMonthly: 0, currency: 'VND', quota: 1000, rateLimit: 10 }],
        legal: null,
      };

      const spy = vi.spyOn(authApiModule, 'apiRequest').mockResolvedValueOnce({ data: mockDetail });

      const result = await getMarketplaceApiDetail('1');

      expect(spy).toHaveBeenCalledWith('/api/marketplace/apis/1', {
        method: 'GET',
        signal: undefined,
      });
      expect(result).toEqual(mockDetail);
    });

    it('rejects invalid or non-numeric id locally with 404 ApiError without calling apiRequest', async () => {
      const spy = vi.spyOn(authApiModule, 'apiRequest');

      await expect(getMarketplaceApiDetail('invalid-id')).rejects.toThrow(ApiError);
      await expect(getMarketplaceApiDetail('0')).rejects.toThrow(ApiError);
      await expect(getMarketplaceApiDetail('-5')).rejects.toThrow(ApiError);
      await expect(getMarketplaceApiDetail('99999999999')).rejects.toThrow(ApiError);

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('formatting helpers', () => {
    it('formatPrice formats 0 as Miễn phí', () => {
      expect(formatPrice(0)).toBe('Miễn phí');
    });

    it('formatPrice formats VND properly with grouping and symbol', () => {
      const formatted = formatPrice(150000, 'VND');
      expect(formatted).toContain('150.000');
      expect(formatted).toContain('₫');
    });

    it('formatPrice handles fallback for NaN', () => {
      expect(formatPrice(NaN)).toBe('0 ₫');
    });

    it('formatPublishedDate formats ISO date safely', () => {
      const formatted = formatPublishedDate('2026-10-21T00:00:00.000Z');
      expect(formatted).not.toBe('—');
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('formatPublishedDate returns dash on null or invalid string', () => {
      expect(formatPublishedDate(null)).toBe('—');
      expect(formatPublishedDate('invalid-date')).toBe('—');
    });
  });
});
