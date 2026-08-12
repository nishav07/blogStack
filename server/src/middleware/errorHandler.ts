import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AuthError } from '../services/authService.js';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  if (err instanceof AuthError) {
    res.status(401).json({ error: err.message });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
}
