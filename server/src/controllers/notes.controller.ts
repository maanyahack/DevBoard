// Import Express types for middleware and handler function signatures.
import type { NextFunction, Request, Response } from 'express';
// Import Zod for request body validation — defines the expected shape of incoming data.
import { z } from 'zod';
// Import User type for the authenticated user object.
import type { User } from '@supabase/supabase-js';
// Import HttpError for throwing typed HTTP errors.
import { HttpError } from '../middleware/error.middleware.js';
// Import AuthenticatedRequest — our custom Request type that includes req.user.
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
// Import service functions that handle the actual database operations.
import { createNote, deleteNote, listNotes, updateNote } from '../services/notes.service.js';

/**
 * Zod schema — validates the request body for creating/updating a note.
 * Each field has rules: type, trimming, min/max length, defaults.
 * If validation fails, Zod throws a ZodError which the error middleware
 * converts to a 400 Bad Request response automatically.
 */
export const noteBodySchema = z.object({
  // 'trim()' removes leading/trailing whitespace, 'min(1)' ensures non-empty,
  // 'max(200)' limits length. Custom error messages for user-friendly feedback.
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  // Content allows empty string (via .default('')) and has a 20K character limit.
  content: z.string().max(20000, 'Content must be 20,000 characters or less').default(''),
  // Category defaults to 'General' if not provided.
  category: z.string().max(100, 'Category must be 100 characters or less').default('General'),
  // isPinned defaults to false if not provided.
  isPinned: z.boolean().default(false),
});

// TypeScript utility type — 'z.infer' extracts the TypeScript type from a Zod schema.
// This means NoteBody always matches the schema exactly — no duplicate type definitions.
type NoteBody = z.infer<typeof noteBodySchema>;

/**
 * Helper — extracts the authenticated user from the request.
 * Throws 401 if somehow the auth middleware didn't attach a user.
 * This is a safety check — requireAuth middleware should have already done this.
 */
function getAuthenticatedUser(req: Request): User {
  // Cast req to AuthenticatedRequest to access the .user property we added.
  const user = (req as AuthenticatedRequest).user;

  if (!user) {
    throw new HttpError(401, 'Authentication required', 'Unauthorized');
  }

  return user;
}

/**
 * GET /api/notes — list all notes for the authenticated user.
 * Returns: { notes: NoteResponse[] }
 */
export async function getNotes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Step 1: Get the authenticated user from the request.
    const user = getAuthenticatedUser(req);
    // Step 2: Fetch all notes from the database via the service layer.
    const notes = await listNotes(user.id);

    // Step 3: Send the response with status 200 (OK).
    res.status(200).json({ notes });
  } catch (error) {
    // If anything goes wrong, pass the error to Express's error handler.
    // The error middleware will convert it to the appropriate HTTP response.
    next(error);
  }
}

/**
 * POST /api/notes — create a new note.
 * Expects: { title, content?, category?, isPinned? } in the request body.
 * Returns: { note: NoteResponse } with status 201 (Created).
 */
export async function postNote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = getAuthenticatedUser(req);
    // '.parse(req.body)' validates the body against the schema.
    // If invalid, throws a ZodError → error middleware returns 400.
    // If valid, returns the typed and defaulted data.
    const body = noteBodySchema.parse(req.body) as NoteBody;
    // Create the note in the database via the service layer.
    const note = await createNote(user.id, body);

    // 201 = "Created" — the standard status code for successful resource creation.
    res.status(201).json({ note });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/notes/:id — update an existing note.
 * ':id' is a route parameter — Express extracts it into req.params.id.
 * Expects: { title, content?, category?, isPinned? } in the request body.
 * Returns: { note: NoteResponse } with status 200 (OK).
 */
export async function putNote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = getAuthenticatedUser(req);
    const body = noteBodySchema.parse(req.body) as NoteBody;
    // Pass req.params.id (the note's UUID from the URL) to the service.
    const note = await updateNote(user.id, req.params.id, body);

    res.status(200).json({ note });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/notes/:id — delete a note permanently.
 * Returns: empty response with status 204 (No Content).
 * 204 means "success, but there's nothing to send back."
 */
export async function deleteNoteById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = getAuthenticatedUser(req);
    // 'await' — wait for the deletion to complete before responding.
    await deleteNote(user.id, req.params.id);

    // 204 = "No Content" — standard status for successful deletion.
    // '.send()' sends an empty response body.
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
