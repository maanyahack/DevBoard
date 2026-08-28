// Import the pino logging library — a fast, low-overhead JSON logger
// designed for Node.js. It's much faster than console.log and
// outputs structured JSON, which is essential for production log aggregation.
import pino from 'pino';

// Import our validated env config so we know NODE_ENV is safe to use.
import { env } from './env.js';

// Create and export a configured pino logger instance.
export const logger = pino({
  // 'level' controls the minimum severity of messages that get logged.
  // In production, only 'info' and above (warn, error, fatal) are logged.
  // In development, 'debug' and above are logged — more verbose for debugging.
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',

  // 'redact' tells pino to strip sensitive fields from log output.
  // If a request's authorization header, cookie, or API key shows up
  // in a log, it will be replaced with '[REDACTED]' instead of being logged.
  redact: {
    paths: [
      'req.headers.authorization',   // Bearer tokens
      'req.headers.cookie',          // Session cookies
      'req.headers.x-api-key',       // Custom API keys
      'res.headers.set-cookie',      // Set-Cookie response headers
    ],
    censor: '[REDACTED]',            // What to replace sensitive data with
  },

  // 'transport' is only used in non-production to make logs human-readable.
  // In production, logs stay as raw JSON for machine parsing.
  transport:
    env.NODE_ENV !== 'production'
      ? {
          // 'pino-pretty' is a transport that formats JSON logs into
          // colorful, readable terminal output during development.
          target: 'pino-pretty',
          options: {
            colorize: true,                          // Add ANSI colors to output
            translateTime: 'SYS:standard',           // Use local time format
            ignore: 'pid,hostname',                  // Don't show process ID or hostname
          },
        }
      : undefined,  // No transport in production = raw JSON

  // 'formatters' customize the shape of log objects.
  // By default, pino logs 'level' as a number (10, 20, 30...).
  // This formatter converts it to a human-readable string like "info", "debug", etc.
  formatters: {
    level: (label) => ({ level: label }),
  },

  // 'timestamp' replaces pino's default epoch timestamp with ISO 8601
  // format (e.g., "2026-08-28T10:30:00.000Z"), which is more readable
  // and standard across logging systems.
  timestamp: pino.stdTimeFunctions.isoTime,
});
