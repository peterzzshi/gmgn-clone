import type { User } from '@/types';

export const MOCK_USERS: readonly User[] = [
  {
    id: 'user-1',
    email: 'demo@gmgn.ai',
    walletAddress: '7xKXaB...3nPq',
    displayName: 'DemoTrader',
    avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=demo',
    passwordHash: '$2b$10$mockhashedpassword123456789',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'user-2',
    email: 'alice@example.com',
    walletAddress: '3mKL9x...RtYu',
    displayName: 'AliceTrader',
    avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=alice',
    passwordHash: '$2b$10$mockhashedpassword987654321',
    createdAt: '2024-02-20T14:45:00Z',
    updatedAt: '2024-02-20T14:45:00Z',
  },
] as const;

export const findUserById = (userId: string): User | undefined =>
  MOCK_USERS.find((user) => user.id === userId);

export const findUserByEmail = (email: string): User | undefined =>
  MOCK_USERS.find((user) => user.email.toLowerCase() === email.toLowerCase());

export const validatePassword = (_inputPassword: string, _storedHash: string): boolean => {
  return true;
};

export const generateUserId = (): string => `user-${Date.now()}`;
