// Import the createApp function which builds and configures the Express app.
// This is separated from index.ts so tests can import createApp without starting a server.
import { createApp } from './app.js';

// Import our validated environment config to access the PORT number.
import { env } from './config/env.js';

// Import the pino logger for logging startup messages.
import { logger } from './config/logger.js';

// Create the Express app instance by calling the factory function.
// This sets up all middleware, routes, and error handlers.
const app = createApp();

// Start the HTTP server and listen for incoming connections.
// 'env.PORT' is the port number (defaults to 4000).
// The callback runs once the server is successfully listening.
app.listen(env.PORT, () => {
  // Log a startup message so developers know the server is ready.
  logger.info(`DevBoard server running on http://localhost:${env.PORT}`);
  // Log the health check URL — useful for verifying the server is up.
  logger.info(`Health check: http://localhost:${env.PORT}/api/health`);
});
