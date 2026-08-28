// Import Express types — only Request and Response (no NextFunction needed
// because this handler never throws errors).
import type { Request, Response } from 'express';

/**
 * Controllers only parse the request and shape the response.
 * A health check has no service layer to call, so it stays trivial.
 */

/**
 * GET /api/health — returns server health status.
 * No authentication required. Used by:
 * - Load balancers to check if the server is alive
 * - Developers to verify the server is running
 * - Monitoring tools to track uptime
 */
export function getHealth(_req: Request, res: Response): void {
  // Respond with a simple JSON object confirming the server is running.
  // '_req' is prefixed with underscore to indicate we intentionally don't use it.
  res.status(200).json({
    status: 'ok',                              // Simple status indicator
    service: 'devboard-server',               // Service name for identification
    timestamp: new Date().toISOString(),       // Current time in ISO 8601 format
  });
}
