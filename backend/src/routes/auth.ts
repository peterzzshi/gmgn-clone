import { Router } from 'express';

import { LogContext, withLogContext } from '@/logger/context';
import { logger } from '@/logger/logger';
import {
  createSuccessResponse,
  createErrorResponse,
  isValidEmail,
  isValidPassword,
  validateRequired,
  generateId,
} from '@/utils';
import { findUserByEmail, validatePassword, generateUserId, MOCK_USERS } from '@data/users';

import type { SafeUser } from '@/types';

export const authRouter = Router();

interface LoginBody {
  email: string;
  password: string;
  [key: string]: unknown;
}

interface RegisterBody {
  email: string;
  password: string;
  confirmPassword: string;
  [key: string]: unknown;
}

const toSafeUser = (user: (typeof MOCK_USERS)[number]): SafeUser => ({
  id: user.id,
  email: user.email,
  walletAddress: user.walletAddress,
  displayName: user.displayName,
  avatarUrl: user.avatarUrl,
  createdAt: user.createdAt,
});

const generateTokens = () => ({
  accessToken: generateId('access'),
  refreshToken: generateId('refresh'),
  expiresIn: 3600,
});

authRouter.post('/login', (req, res) => {
  const context = LogContext.create('auth');

  withLogContext(context, () => {
    const body = req.body as LoginBody;

    logger.info('Login attempt', { email: body.email });

    const missingFields = validateRequired(body, ['email', 'password']);
    if (missingFields.length > 0) {
      res.status(400).json(
        createErrorResponse('VALIDATION_ERROR', 'Missing required fields', {
          fields: missingFields,
        }),
      );
      return;
    }

    if (!isValidEmail(body.email)) {
      res.status(400).json(createErrorResponse('VALIDATION_ERROR', 'Invalid email format'));
      return;
    }

    const user = findUserByEmail(body.email);
    if (!user) {
      logger.debug('User not found, creating mock session', { email: body.email });
    }

    if (user && !validatePassword(body.password, user.passwordHash)) {
      logger.warn('Login failed - invalid credentials', { email: body.email });
      res.status(401).json(createErrorResponse('AUTH_ERROR', 'Invalid credentials'));
      return;
    }

    const tokens = generateTokens();

    const safeUser: SafeUser = user
      ? toSafeUser(user)
      : {
          id: generateUserId(),
          email: body.email,
          walletAddress: null,
          displayName: body.email.split('@')[0] ?? 'User',
          avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${body.email}`,
          createdAt: new Date().toISOString(),
        };

    logger.info('Login successful', { email: safeUser.email });

    res.json(
      createSuccessResponse({
        user: safeUser,
        tokens,
      }),
    );
  });
});

authRouter.post('/register', (req, res) => {
  const context = LogContext.create('auth');

  withLogContext(context, () => {
    const body = req.body as RegisterBody;

    logger.info('Register attempt', { email: body.email });

    const missingFields = validateRequired(body, ['email', 'password', 'confirmPassword']);
    if (missingFields.length > 0) {
      res.status(400).json(
        createErrorResponse('VALIDATION_ERROR', 'Missing required fields', {
          fields: missingFields,
        }),
      );
      return;
    }

    if (!isValidEmail(body.email)) {
      res.status(400).json(createErrorResponse('VALIDATION_ERROR', 'Invalid email format'));
      return;
    }

    if (!isValidPassword(body.password)) {
      res
        .status(400)
        .json(createErrorResponse('VALIDATION_ERROR', 'Password must be at least 6 characters'));
      return;
    }

    if (body.password !== body.confirmPassword) {
      res.status(400).json(createErrorResponse('VALIDATION_ERROR', 'Passwords do not match'));
      return;
    }

    const existingUser = findUserByEmail(body.email);
    if (existingUser) {
      logger.warn('Registration failed - email already exists', { email: body.email });
      res.status(409).json(createErrorResponse('CONFLICT', 'Email already registered'));
      return;
    }

    const newUser: SafeUser = {
      id: generateUserId(),
      email: body.email,
      walletAddress: null,
      displayName: body.email.split('@')[0] ?? 'User',
      avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${body.email}`,
      createdAt: new Date().toISOString(),
    };

    const tokens = generateTokens();

    logger.info('Registration successful', { email: newUser.email });

    res.status(201).json(
      createSuccessResponse({
        user: newUser,
        tokens,
      }),
    );
  });
});

authRouter.post('/logout', (_req, res) => {
  const context = LogContext.create('auth');

  withLogContext(context, () => {
    logger.info('Logout');
    res.json(createSuccessResponse(null, 'Logged out successfully'));
  });
});

authRouter.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json(createErrorResponse('AUTH_ERROR', 'No token provided'));
    return;
  }

  // For demo, return mock user
  const user = MOCK_USERS[0];
  if (user) {
    res.json(createSuccessResponse(toSafeUser(user)));
  } else {
    res.status(404).json(createErrorResponse('NOT_FOUND', 'User not found'));
  }
});
