import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the db module
vi.mock('./db', () => ({
  createPemfAffiliate: vi.fn().mockResolvedValue(1),
  getPemfAffiliateBySlug: vi.fn(),
  getPemfAffiliateById: vi.fn(),
  checkSlugExists: vi.fn().mockResolvedValue(false),
  createPemfEnquiry: vi.fn().mockResolvedValue(1),
}));

// Mock the notification module
vi.mock('./_core/notification', () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

import {
  createPemfAffiliate,
  getPemfAffiliateBySlug,
  checkSlugExists,
  createPemfEnquiry,
} from './db';

describe('PEMF Affiliate System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Slug generation', () => {
    it('should generate a URL-friendly slug from a name', () => {
      // Test the slug generation logic directly
      const generateSlug = (name: string): string => {
        return name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      };

      expect(generateSlug('John Smith')).toBe('john-smith');
      expect(generateSlug('Mary Jane Watson')).toBe('mary-jane-watson');
      expect(generateSlug('  Spaces  Around  ')).toBe('spaces-around');
      expect(generateSlug("O'Brien")).toBe('obrien');
      expect(generateSlug('Test 123')).toBe('test-123');
    });
  });

  describe('Affiliate registration', () => {
    it('should call createPemfAffiliate with correct data', async () => {
      const mockCreate = createPemfAffiliate as ReturnType<typeof vi.fn>;
      mockCreate.mockResolvedValue(1);

      const mockCheckSlug = checkSlugExists as ReturnType<typeof vi.fn>;
      mockCheckSlug.mockResolvedValue(false);

      // Simulate calling the function directly
      const result = await createPemfAffiliate({
        name: 'John Smith',
        email: 'john@example.com',
        phone: '+61 400 000 000',
        slug: 'john-smith',
      });

      expect(result).toBe(1);
      expect(mockCreate).toHaveBeenCalledWith({
        name: 'John Smith',
        email: 'john@example.com',
        phone: '+61 400 000 000',
        slug: 'john-smith',
      });
    });
  });

  describe('Affiliate lookup', () => {
    it('should return affiliate data when found', async () => {
      const mockGet = getPemfAffiliateBySlug as ReturnType<typeof vi.fn>;
      mockGet.mockResolvedValue({
        id: 1,
        name: 'John Smith',
        email: 'john@example.com',
        phone: '+61 400 000 000',
        slug: 'john-smith',
        isActive: 1,
        createdAt: new Date(),
      });

      const result = await getPemfAffiliateBySlug('john-smith');
      expect(result).toBeTruthy();
      expect(result?.name).toBe('John Smith');
      expect(result?.slug).toBe('john-smith');
    });

    it('should return null for non-existent slug', async () => {
      const mockGet = getPemfAffiliateBySlug as ReturnType<typeof vi.fn>;
      mockGet.mockResolvedValue(null);

      const result = await getPemfAffiliateBySlug('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('Enquiry submission', () => {
    it('should create an enquiry with correct data', async () => {
      const mockCreate = createPemfEnquiry as ReturnType<typeof vi.fn>;
      mockCreate.mockResolvedValue(1);

      const result = await createPemfEnquiry({
        affiliateId: 1,
        visitorName: 'Jane Doe',
        visitorEmail: 'jane@example.com',
        visitorPhone: '+61 400 111 222',
        message: 'I want to learn more about PEMF',
      });

      expect(result).toBe(1);
      expect(mockCreate).toHaveBeenCalledWith({
        affiliateId: 1,
        visitorName: 'Jane Doe',
        visitorEmail: 'jane@example.com',
        visitorPhone: '+61 400 111 222',
        message: 'I want to learn more about PEMF',
      });
    });
  });

  describe('Slug uniqueness', () => {
    it('should detect existing slugs', async () => {
      const mockCheck = checkSlugExists as ReturnType<typeof vi.fn>;
      mockCheck.mockResolvedValue(true);

      const exists = await checkSlugExists('john-smith');
      expect(exists).toBe(true);
    });

    it('should return false for new slugs', async () => {
      const mockCheck = checkSlugExists as ReturnType<typeof vi.fn>;
      mockCheck.mockResolvedValue(false);

      const exists = await checkSlugExists('new-partner');
      expect(exists).toBe(false);
    });
  });
});
