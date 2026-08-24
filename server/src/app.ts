import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import apiRoutes from './routes/index.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';
import { apiLimiter, aiLimiter, strictLimiter } from './middleware/rateLimit.middleware.js';

/**
 * Build and configure the Express app.
 * Kept separate from index.ts so it can be imported in tests without
 * actually opening a network port.
 */
export function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  app.use(
    pinoHttp({
      logger,
      customLogLevel: (res, err) => {
        if (res.statusCode >= 400 && res.statusCode < 500) return 'warn';
        if (res.statusCode >= 500 || err) return 'error';
        return 'info';
      },
      customSuccessMessage: (req, res) =>
        `${req.method} ${req.originalUrl} ${res.statusCode}`,
      customErrorMessage: (req, res) =>
        `${req.method} ${req.originalUrl} ${res.statusCode}`,
    }),
  );

  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  app.use('/api/auth', strictLimiter);
  app.use('/api/ai', aiLimiter);
  app.use('/api', apiLimiter);

  app.use('/api', apiRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
