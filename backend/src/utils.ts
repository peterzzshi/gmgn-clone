import type { ApiResponse, ApiError, PaginatedResponse, PaginationParams } from './types';
import { v4 as uuidv4 } from 'uuid';

export const createSuccessResponse = <T>(
  data: T,
  message?: string | undefined,
): ApiResponse<T> => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString(),
});

export const createErrorResponse = (
  code: string,
  message: string,
  details?: Record<string, unknown> | undefined,
): ApiError => ({
  success: false,
  error: {
    code,
    message,
    details,
  },
  timestamp: new Date().toISOString(),
});

export const createPaginatedResponse = <T>(
  items: readonly T[],
  params: PaginationParams,
  total: number,
): PaginatedResponse<T> => {
  const totalPages = Math.ceil(total / params.limit);

  return {
    items,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      hasMore: params.page < totalPages,
    },
  };
};

export const paginate = <T>(
  items: readonly T[],
  page: number,
  limit: number,
): readonly T[] => {
  const start = (page - 1) * limit;
  return items.slice(start, start + limit);
};

export const parsePaginationParams = (
  query: Record<string, unknown>,
  defaults: PaginationParams = { page: 1, limit: 20 },
): PaginationParams => {
  const page = Math.max(1, Number(query.page) || defaults.page);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || defaults.limit));

  return { page, limit };
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean =>
  password.length >= 6;

export const validateRequired = (
  obj: Record<string, unknown>,
  fields: readonly string[],
): string[] => {
  const missing: string[] = [];
  for (const field of fields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
      missing.push(field);
    }
  }
  return missing;
};

export const nowInSeconds = (): number => Math.floor(Date.now() / 1000);

export const secondsAgo = (seconds: number): number => nowInSeconds() - seconds;

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m`;
  }
  if (seconds < 86400) {
    return `${Math.floor(seconds / 3600)}h`;
  }
  return `${Math.floor(seconds / 86400)}d`;
};

export const generateId = (prefix: string): string => {
  const uuid = uuidv4().split('-')[0];
  return `${prefix}-${uuid}`;
};

