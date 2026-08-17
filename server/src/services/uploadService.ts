import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';
import { env, isCloudinaryConfigured } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });
}

export interface UploadSignature {
  timestamp: number;
  signature: string;
  cloudName: string;
  apiKey: string;
  folder: string;
}

export function createUploadSignature(): UploadSignature {
  if (!isCloudinaryConfigured()) {
    throw new AppError('Cloudinary is not configured', 503);
  }

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = `folder=${env.cloudinary.folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash('sha1')
    .update(paramsToSign + env.cloudinary.apiSecret)
    .digest('hex');

  return {
    timestamp,
    signature,
    cloudName: env.cloudinary.cloudName,
    apiKey: env.cloudinary.apiKey,
    folder: env.cloudinary.folder,
  };
}
