import { z } from 'zod';

export const httpUrlSchema = z
  .string()
  .trim()
  .max(1000)
  .refine(
    (url) => {
      if (!url) return true;
      try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'URL must start with http:// or https:// and be a valid URL' }
  );

export const requiredHttpUrlSchema = z
  .string()
  .trim()
  .min(1, 'URL is required')
  .max(1000)
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'URL must start with http:// or https:// and be a valid URL' }
  );

export const platformSchema = z.object({
  platform: z.enum(['youtube', 'instagram', 'tiktok', 'twitch', 'blog', 'other']),
  handle: z.string().trim().min(1, 'Handle is required').max(100),
  url: requiredHttpUrlSchema,
  followers: z.coerce.number().min(0, 'Followers must be 0 or more').default(0),
  engagementRate: z.coerce.number().min(0).max(100).optional(),
});

export const creatorProfileSchema = z.object({
  displayName: z.string().trim().min(1, 'Display name is required').max(100),
  bio: z.string().trim().max(500, 'Bio cannot exceed 500 characters').optional().default(''),
  niche: z.string().trim().min(1, 'Niche is required').max(100),
  platforms: z.array(platformSchema).default([]),
  location: z.string().trim().max(100).optional().default(''),
  languages: z.array(z.string().trim().max(50)).default([]),
  contentTypes: z.array(z.string().trim().max(50)).default([]),
  rateNotes: z.string().trim().max(500).optional().default(''),
  avatarUrl: httpUrlSchema.optional().or(z.literal('')),
  isPublic: z.boolean().default(true),
});

export const brandProfileSchema = z.object({
  companyName: z.string().trim().min(1, 'Company name is required').max(120),
  industry: z.string().trim().min(1, 'Industry is required').max(100),
  website: httpUrlSchema.optional().or(z.literal('')),
  about: z.string().trim().max(800, 'About cannot exceed 800 characters').optional().default(''),
  targetAudience: z.string().trim().max(500).optional().default(''),
  logoUrl: httpUrlSchema.optional().or(z.literal('')),
  isPublic: z.boolean().default(true),
});

export const freelancerProfileSchema = z.object({
  headline: z.string().trim().min(1, 'Headline is required').max(150),
  skills: z.array(z.string().trim().max(50)).default([]),
  bio: z.string().trim().max(800, 'Bio cannot exceed 800 characters').optional().default(''),
  portfolioLinks: z.array(requiredHttpUrlSchema).default([]),
  availability: z.enum(['available', 'busy']).default('available'),
  hourlyRate: z.coerce.number().min(0).optional(),
  isPublic: z.boolean().default(true),
});

export const talentManagerProfileSchema = z.object({
  agencyName: z.string().trim().min(1, 'Agency name is required').max(120),
  about: z.string().trim().max(800, 'About cannot exceed 800 characters').optional().default(''),
  website: httpUrlSchema.optional().or(z.literal('')),
  isPublic: z.boolean().default(true),
});

export const portfolioItemSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(150),
  description: z.string().trim().max(1000).optional().default(''),
  type: z.enum(['video', 'image', 'link', 'article']),
  url: requiredHttpUrlSchema,
  thumbnailUrl: httpUrlSchema.optional().or(z.literal('')),
});

export const portfolioUpdateSchema = portfolioItemSchema.partial();

