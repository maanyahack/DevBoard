import type { Request, Response } from 'express';

/**
 * Controllers only parse the request and shape the response.
 * A health check has no service layer to call, so it stays trivial.
 */
export function getHealth(_req: Request, res: Response): void {
  res.status(200).json({
    status: 'ok',
    service: 'devboard-server',
    timestamp: new Date().toISOString(),
  });
}
