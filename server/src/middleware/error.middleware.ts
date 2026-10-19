// Import Express types — we need Request, Response, and NextFunction
// to define our middleware function signatures with full type safety.
import type { NextFunction, Request, Response } from 'express';

// Import ZodError — the error class that Zod throws when validation fails.
// We need this to convert Zod errors into proper HTTP 400 responses.
import { ZodError } from 'zod';

/**
 * HttpError is a custom error class that carries HTTP-specific data:
 * - statusCode: the HTTP status code to send (400, 401, 404, 500, etc.)
 * - message: a human-readable error description
 * - error: a short error label like "Not Found" or "Unauthorized"
 * - details: optional extra data about the error
 *
 * By extending Error, we can 'throw new HttpError(...)' anywhere in the
 * server and the centralized error handler will catch it.
 */
export class HttpError extends Error {
  constructor(
    // 'public' automatically creates a property on the class instance
    public statusCode: number,
    message: string,
    public error: string,
    public details?: unknown,
  ) {
    // Call the parent Error constructor with the message.
    super(message);
    // Set the error name to 'HttpError' so it shows up clearly in stack traces.
    this.name = 'HttpError';
  }
}

/**
 * 404 handler — when no route matches the incoming request URL.
 * Express treats middleware with exactly (req, res) as the last resort
 * before the error handler. This catches all unmatched routes.
 */
export function notFound(req: Request, res: Response): void {
  // Respond with a 404 JSON object telling the client the route doesn't exist.
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} does not exist.`,
  });
}

/**
 * Centralized error handler. Express recognizes it by its 4 arguments
 * (err, req, res, next). Every thrown or next(err) error funnels here
 * so we never leak stack traces to clients and always respond with
 * a consistent JSON shape.
 */
export function errorHandler(
  // 'err: unknown' means we don't know what type the error is yet —
  // we check it at runtime with instanceof below.
  err: unknown,
  _req: Request,
  res: Response,
  // '_next' is prefixed with underscore to tell TypeScript we intentionally
  // don't use it — Express requires this parameter to exist for the
  // function to be recognized as an error handler.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // CASE 1: Zod validation error — the request body/params didn't match
  // the expected schema. Return 400 with the specific field errors.
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Validation failed',
      // '.flatten()' converts Zod's nested error tree into a flat
      // { fieldErrors: { fieldName: ["error message"] } } object.
      details: err.flatten(),
    });
    return;  // Stop processing — we've sent the response.
  }

  // CASE 2: Our custom HttpError — controllers throw these when something
  // goes wrong (e.g., note not found, unauthorized access).
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      error: err.error,
      message: err.message,
      // Only include 'details' if it was provided (it's optional).
      // The spread '...' adds the details property only when defined.
      ...(err.details !== undefined ? { details: err.details } : {}),
    });
    return;  // Stop processing — we've sent the response.
  }

  // CASE 3: Something unexpected went wrong — log it server-side and
  // return a generic 500 error (never expose internal error details to clients).
  const message = err instanceof Error ? err.message : 'Unknown error';
  console.error('[error]', message);

  res.status(500).json({
    error: 'Internal Server Error',
    message,
  });
}
