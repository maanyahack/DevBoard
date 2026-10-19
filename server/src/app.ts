// Import the Express framework — the most popular Node.js web framework.
// Express provides routing, middleware, and HTTP utilities.
import express from 'express';

// Import the cors middleware — handles Cross-Origin Resource Sharing.
// Without this, the browser would block API requests from localhost:5173
// (Vite dev server) to localhost:4000 (Express server) due to same-origin policy.
import cors from 'cors';

// Import pino-http — automatically logs every incoming HTTP request and
// response. It hooks into Express middleware to log method, URL, status code, etc.
import pinoHttp from 'pino-http';

// Import our validated environment config (PORT, CLIENT_URL, etc.)
import { env } from './config/env.js';

// Import our configured pino logger for manual logging.
import { logger } from './config/logger.js';

// Import all API routes mounted under /api.
import apiRoutes from './routes/index.js';

// Import error handling middleware (404 handler and centralized error handler).
import { errorHandler, notFound } from './middleware/error.middleware.js';

// Import rate limiting middleware (general, strict, and AI-specific).
import { apiLimiter, aiLimiter, strictLimiter } from './middleware/rateLimit.middleware.js';

/**
 * Build and configure the Express app.
 * Kept separate from index.ts so it can be imported in tests without
 * actually opening a network port.
 */
export function createApp() {
  // Create a new Express application instance.
  const app = express();

  // 'trust proxy' tells Express to trust the first proxy in front of it
  // (e.g., Vercel, nginx). This ensures req.ip and req.protocol are
  // correct when behind a reverse proxy — important for rate limiting
  // (which uses IP addresses) and HTTPS detection.
  app.set('trust proxy', 1);

  // --- MIDDLEWARE STACK ---
  // Middleware runs in the order it's registered, top to bottom.

  // 1) HTTP request/response logging.
  // pinoHttp automatically logs each request with method, URL, status code, etc.
  app.use(
    pinoHttp({
      logger,  // Use our pre-configured pino logger
      // Custom log levels based on HTTP status code:
      customLogLevel: (res, err) => {
        if (res.statusCode >= 400 && res.statusCode < 500) return 'warn';  // 4xx = warning
        if (res.statusCode >= 500 || err) return 'error';                   // 5xx = error
        return 'info';                                                       // 2xx, 3xx = info
      },
      // Custom success message format: "GET /api/notes 200"
      customSuccessMessage: (req, res) =>
        `${req.method} ${req.originalUrl} ${res.statusCode}`,
      // Custom error message format (same pattern).
      customErrorMessage: (req, res) =>
        `${req.method} ${req.originalUrl} ${res.statusCode}`,
    }),
  );

  // 2) CORS middleware — allows the frontend (different port) to make
  // API requests. 'credentials: true' allows cookies/auth headers.
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));

  // 3) JSON body parser — reads JSON request bodies and puts them in req.body.
  // The '1mb' limit prevents very large payloads from consuming server memory.
  app.use(express.json({ limit: '1mb' }));

  // 4) Rate limiting — applied in order from most restrictive to least:
  //    - Auth routes get strictLimiter (20 req/hour)
  //    - AI routes get aiLimiter (50 req/hour)
  //    - All other /api routes get apiLimiter (200 req/15min)
  // Order matters: Express checks these top-down. A request to /api/auth/login
  // hits BOTH strictLimiter AND apiLimiter, so it's limited by the stricter one.
  app.use('/api/auth', strictLimiter);  // Login, signup, password reset
  app.use('/api/ai', aiLimiter);       // Gemini AI features
  app.use('/api', apiLimiter);          // General API routes

  // 5) Mount all API routes under the /api prefix.
  // E.g., app.use('/api', apiRoutes) means routes defined as '/notes'
  // in apiRoutes become '/api/notes' in the full app.
  app.use('/api', apiRoutes);

  // 6) 404 handler — if no route matched above, return a 404 JSON response.
  // This must come AFTER all route registrations.
  app.use(notFound);

  // 7) Centralized error handler — catches all errors thrown by any
  // middleware or route above. Express identifies it by having 4 parameters.
  // This MUST be the very last middleware — it's the "catch-all."
  app.use(errorHandler);

  // Return the fully configured app (without starting it — that's index.ts's job).
  return app;
}
