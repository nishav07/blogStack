import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { createUploadSignature } from '../services/uploadService.js';

export function getUploadSignature(_req: AuthenticatedRequest, res: Response): void {
  const signature = createUploadSignature();
  res.json(signature);
}
