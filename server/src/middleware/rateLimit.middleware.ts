// Import the rateLimit middleware from the 'express-rate-limit' package.
// Rate limiting restricts how many requests a client can make in a given
// time window, preventing abuse and protecting the server from overload.
import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter — applied to most /api routes.
 * Allows 200 requests per 15-minute window per IP address.
 * This is the "default" limiter for normal CRUD operations.
 */
export const apiLimiter = rateLimit({
  // 'windowMs' — the time window in milliseconds. 15 minutes = 15 * 60 * 1000.
  windowMs: 15 * 60 * 1000,

  // 'max' — maximum number of requests allowed per window per IP.
  max: 200,

  // 'standardHeaders: true' — send rate limit info in standard
  // RateLimit-* headers (RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset).
  standardHeaders: true,

  // 'legacyHeaders: false' — don't send the old X-RateLimit-* headers.
  // We use the modern standard headers instead.
  legacyHeaders: false,

  // The JSON response sent when a client exceeds the rate limit.
  // This gets sent as the HTTP response body with a 429 status code.
  message: {
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Try again in 15 minutes.',
  },
});

/**
 * Strict rate limiter — applied to auth routes (/api/auth/*).
 * Only 20 requests per hour. This prevents brute-force login attempts,
 * password reset abuse, and other auth-related attacks.
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 20,                    // 20 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Too many attempts. Try again in an hour.',
  },
});

/**
 * AI rate limiter — applied to AI routes (/api/ai/*).
 * 50 requests per hour. AI API calls (Gemini) are expensive and slow,
 * so we rate limit them more aggressively than regular API calls
 * but less aggressively than auth endpoints.
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 50,                    // 50 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'AI rate limit exceeded. Try again in an hour.',
  },
});
