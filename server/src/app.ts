import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import apiRoutes from './routes/index.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';

/**
 * Build and configure the Express app.
 * Kept separate from index.ts so it can be imported in tests without
 * actually opening a network port.
 */
export function createApp() {
  const app = express();

  // Only allow our known frontend origin to call the API.
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(express.json());

  app.use('/api', apiRoutes);

  // Order matters: 404 first, then the error handler last.
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
