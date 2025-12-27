import { Router } from 'express';

import type { SafeUser } from '@/types';
import {
  findUserByEmail,
  validatePassword,
  generateUserId,
  MOCK_USERS,
} from '@data/users';
import {
  createSuccessResponse,
  createErrorResponse,
  isValidEmail,
  isValidPassword,
  validateRequired,
  generateId,
} from '@/utils';

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

const toSafeUser = (user: typeof MOCK_USERS[number]): SafeUser => ({
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
  const body = req.body as LoginBody;

  console.log('[Auth] Login attempt:', body.email);

  // Validate required fields
  const missingFields = validateRequired(body, ['email', 'password']);
  if (missingFields.length > 0) {
    res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', 'Missing required fields', { fields: missingFields }),
    );
    return;
  }

  // Validate email format
  if (!isValidEmail(body.email)) {
    res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', 'Invalid email format'),
    );
    return;
  }

  // Find user
  const user = findUserByEmail(body.email);
  if (!user) {
    // For demo, accept any email
    console.log('[Auth] User not found, creating mock session for:', body.email);
  }

  // Validate password (mock - always passes for demo)
  if (user && !validatePassword(body.password, user.passwordHash)) {
    res.status(401).json(
      createErrorResponse('AUTH_ERROR', 'Invalid credentials'),
    );
    return;
  }

  // Generate tokens
  const tokens = generateTokens();

  // Return user data (without password)
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

  console.log('[Auth] Login successful:', safeUser.email);

  res.json(
    createSuccessResponse({
      user: safeUser,
      tokens,
    }),
  );
});

authRouter.post('/register', (req, res) => {
  const body = req.body as RegisterBody;

  console.log('[Auth] Register attempt:', body.email);

  // Validate required fields
  const missingFields = validateRequired(body, ['email', 'password', 'confirmPassword']);
  if (missingFields.length > 0) {
    res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', 'Missing required fields', { fields: missingFields }),
    );
    return;
  }

  // Validate email format
  if (!isValidEmail(body.email)) {
    res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', 'Invalid email format'),
    );
    return;
  }

  // Validate password strength
  if (!isValidPassword(body.password)) {
    res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', 'Password must be at least 6 characters'),
    );
    return;
  }

  // Validate password match
  if (body.password !== body.confirmPassword) {
    res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', 'Passwords do not match'),
    );
    return;
  }

  // Check if user exists
  const existingUser = findUserByEmail(body.email);
  if (existingUser) {
    res.status(409).json(
      createErrorResponse('CONFLICT', 'Email already registered'),
    );
    return;
  }

  // Create new user (mock)
  const newUser: SafeUser = {
    id: generateUserId(),
    email: body.email,
    walletAddress: null,
    displayName: body.email.split('@')[0] ?? 'User',
    avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${body.email}`,
    createdAt: new Date().toISOString(),
  };

  const tokens = generateTokens();

  console.log('[Auth] Registration successful:', newUser.email);

  res.status(201).json(
    createSuccessResponse({
      user: newUser,
      tokens,
    }),
  );
});

authRouter.post('/logout', (_req, res) => {
  console.log('[Auth] Logout');

  res.json(createSuccessResponse(null, 'Logged out successfully'));
});

authRouter.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json(
      createErrorResponse('AUTH_ERROR', 'No token provided'),
    );
    return;
  }

  // For demo, return mock user
  const user = MOCK_USERS[0];
  if (user) {
    res.json(createSuccessResponse(toSafeUser(user)));
  } else {
    res.status(404).json(
      createErrorResponse('NOT_FOUND', 'User not found'),
    );
  }
});
