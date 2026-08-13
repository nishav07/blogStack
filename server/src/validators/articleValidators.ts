import { z } from 'zod';

const coverImageSchema = z
  .object({
    url: z.union([z.string().url('Cover image URL must be valid'), z.literal('')]).optional(),
    alt: z.string().max(200, 'Alt text must be 200 characters or fewer').optional(),
  })
  .nullable()
  .optional();

const seoSchema = z.object({
  title: z.string().max(70, 'SEO title must be 70 characters or fewer').optional(),
  description: z.string().max(160, 'SEO description must be 160 characters or fewer').optional(),
});

const tagsSchema = z
  .array(
    z
      .string()
      .trim()
      .min(1, 'Tag cannot be empty')
      .max(50, 'Tag must be 50 characters or fewer')
  )
  .max(20, 'Maximum 20 tags allowed')
  .default([]);

export const createArticleSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be 200 characters or fewer'),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .max(200, 'Slug must be 200 characters or fewer')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
  excerpt: z.string().max(500, 'Excerpt must be 500 characters or fewer').optional(),
  content: z.string().default(''),
  coverImage: coverImageSchema,
  categoryId: z.string().min(1, 'Category is required'),
  tags: tagsSchema,
  seo: seoSchema.optional(),
});

export const updateArticleSchema = createArticleSchema.partial().extend({
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .max(200, 'Slug must be 200 characters or fewer')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(100, 'Name must be 100 characters or fewer'),
  description: z.string().max(300, 'Description must be 300 characters or fewer').optional(),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
