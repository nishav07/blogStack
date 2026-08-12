import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';
import { env } from '../config/env.js';
import { LoginInput } from '../validators/authValidators.js';
import { comparePassword } from '../utils/password.js';

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: 'admin';
}

function toSafeUser(user: IUser): SafeUser {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function login(input: LoginInput): Promise<{ token: string; user: SafeUser }> {
  const user = await User.findOne({ email: input.email.toLowerCase() }).select('+passwordHash');

  if (!user) {
    throw new AuthError('Invalid email or password');
  }

  const isValid = await comparePassword(input.password, user.passwordHash);
  if (!isValid) {
    throw new AuthError('Invalid email or password');
  }

  const payload: JwtPayload = {
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);

  return { token, user: toSafeUser(user) };
}

export async function getUserById(id: string): Promise<SafeUser | null> {
  const user = await User.findById(id);
  if (!user) return null;
  return toSafeUser(user);
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export { toSafeUser };
