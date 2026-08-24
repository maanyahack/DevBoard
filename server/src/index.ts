import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`DevBoard server running on http://localhost:${env.PORT}`);
  logger.info(`Health check: http://localhost:${env.PORT}/api/health`);
});
