import { Response, NextFunction } from 'express';
import { COOKIE_NAME } from '../config/env.js';
import { AuthenticatedRequest, getCookieOptions } from '../middleware/auth.js';
import { login as loginService } from '../services/authService.js';
import { LoginInput } from '../validators/authValidators.js';

export async function login(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as LoginInput;
    const { token, user } = await loginService(input);

    res.cookie(COOKIE_NAME, token, getCookieOptions());
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export function logout(_req: AuthenticatedRequest, res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: getCookieOptions().secure,
    sameSite: 'strict',
    path: '/',
  });
  res.json({ message: 'Logged out successfully' });
}

export function me(req: AuthenticatedRequest, res: Response): void {
  res.json({ user: req.user });
}
