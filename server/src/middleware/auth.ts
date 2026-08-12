import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env, COOKIE_NAME } from '../config/env.js';
import { getUserById, JwtPayload } from '../services/authService.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'admin';
  };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = req.cookies[COOKIE_NAME];

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;

    getUserById(decoded.sub)
      .then((user) => {
        if (!user) {
          res.status(401).json({ error: 'Authentication required' });
          return;
        }

        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
        next();
      })
      .catch(next);
  } catch {
    res.status(401).json({ error: 'Authentication required' });
  }
}

export function adminMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  next();
}

export function getCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'strict' as const,
    maxAge: 8 * 60 * 60 * 1000,
    path: '/',
  };
}
