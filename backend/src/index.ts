import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import type { Request, Response, NextFunction } from 'express';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 4000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response): void => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes will be added here
// app.use('/api/auth', authRoutes);
// app.use('/api/wallet', walletRoutes);
// app.use('/api/trading', tradingRoutes);
// app.use('/api/market', marketRoutes);

// 404 handler
app.use((_req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
  });
});

// Error handler
interface ErrorWithStatus extends Error {
  status?: number;
}

app.use((err: ErrorWithStatus, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('Error:', err);
  res.status(err.status ?? 500).json({
    error: err.name ?? 'Internal Server Error',
    message: err.message ?? 'An unexpected error occurred',
  });
});

// Start server
app.listen(PORT, (): void => {
  console.info(`🚀 Server running on http://localhost:${PORT}`);
  console.info(`📊 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
