import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICoverImage {
  url?: string;
  publicId?: string;
  alt?: string;
}

export interface ISeo {
  title?: string;
  description?: string;
}

export interface IArticle extends Document {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: ICoverImage | null;
  categoryId: Types.ObjectId;
  categoryName: string;
  categorySlug: string;
  tags: string[];
  status: 'draft' | 'published';
  seo: ISeo;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const coverImageSchema = new Schema<ICoverImage>(
  {
    url: { type: String, trim: true },
    publicId: { type: String, trim: true },
    alt: { type: String, trim: true },
  },
  { _id: false }
);

const seoSchema = new Schema<ISeo>(
  {
    title: { type: String, trim: true },
    description: { type: String, trim: true },
  },
  { _id: false }
);

const articleSchema = new Schema<IArticle>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    excerpt: {
      type: String,
      trim: true,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    coverImage: {
      type: coverImageSchema,
      default: null,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    categoryName: {
      type: String,
      required: true,
      trim: true,
    },
    categorySlug: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    seo: {
      type: seoSchema,
      default: () => ({}),
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ categoryId: 1, status: 1 });
articleSchema.index({ tags: 1 });

export const Article = mongoose.model<IArticle>('Article', articleSchema);
