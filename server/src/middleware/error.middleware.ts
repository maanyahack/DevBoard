import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public error: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/** Catch-all for unmatched routes -> 404 JSON. */
export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} does not exist.`,
  });
}

/**
 * Centralized error handler. Express recognizes it by its 4 arguments.
 * Every thrown/next(err) error funnels here so we never leak stack traces
 * to clients and always respond with a consistent JSON shape.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Validation failed',
      details: err.flatten(),
    });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      error: err.error,
      message: err.message,
      ...(err.details !== undefined ? { details: err.details } : {}),
    });
    return;
  }

  const message = err instanceof Error ? err.message : 'Unknown error';
  console.error('[error]', message);

  res.status(500).json({
    error: 'Internal Server Error',
    message,
  });
}
