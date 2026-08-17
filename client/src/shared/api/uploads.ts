import { api } from './client';

export interface UploadSignature {
  timestamp: number;
  signature: string;
  cloudName: string;
  apiKey: string;
  folder: string;
}

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

export async function getUploadSignature(): Promise<UploadSignature> {
  return api.post<UploadSignature>('/admin/uploads/sign');
}

export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  const signature = await getUploadSignature();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signature.apiKey);
  formData.append('timestamp', String(signature.timestamp));
  formData.append('signature', signature.signature);
  formData.append('folder', signature.folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message ?? 'Image upload failed');
  }

  return {
    url: data.secure_url as string,
    publicId: data.public_id as string,
  };
}
