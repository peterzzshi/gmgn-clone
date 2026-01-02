import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { LogContext, withLogContext } from '@/logger/context';
import { logger } from '@/logger/logger';
import { authRouter } from '@routes/auth';
import { copyTradeRouter } from '@routes/copyTrade';
import { marketRouter } from '@routes/market';
import { tradingRouter } from '@routes/trading';
import { walletRouter } from '@routes/wallet';

import { getPort, getCorsOrigin } from './config/environmentVariables';
import { createSuccessResponse, createErrorResponse } from './utils';

import type { Request, Response, NextFunction } from 'express';

dotenv.config();

const PORT = getPort();
const CORS_ORIGIN = getCorsOrigin();

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  }),
);

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json(
    createSuccessResponse({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }),
  );
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/market', marketRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/trading', tradingRouter);
app.use('/api/copy-trade', copyTradeRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json(createErrorResponse('NOT_FOUND', 'The requested resource was not found'));
});

interface ErrorWithStatus extends Error {
  status?: number;
  code?: string;
}

app.use((err: ErrorWithStatus, _req: Request, res: Response, _next: NextFunction) => {
  const context = LogContext.create('error-handler');

  withLogContext(context, () => {
    logger.error('Unhandled error', err);

    const status = err.status ?? 500;
    const code = err.code ?? 'INTERNAL_ERROR';
    const message = err.message ?? 'An unexpected error occurred';

    res.status(status).json(createErrorResponse(code, message));
  });
});

app.listen(PORT, () => {
  const context = LogContext.create('startup');

  withLogContext(context, () => {
    logger.info('Server started', { port: PORT, corsOrigin: CORS_ORIGIN });

    console.log(`
╔════════════════════════════════════════════╗
║                                            ║
║   🚀 GMGN Clone API Server                 ║
║                                            ║
║   URL:    http://localhost:${PORT}            ║
║   Health: http://localhost:${PORT}/api/health ║
║   CORS:   ${CORS_ORIGIN}              ║
║                                            ║
╚════════════════════════════════════════════╝
    `);
  });
});
