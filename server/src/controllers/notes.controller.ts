import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import type { User } from '@supabase/supabase-js';
import { HttpError } from '../middleware/error.middleware.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { createNote, deleteNote, listNotes, updateNote } from '../services/notes.service.js';

export const noteBodySchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  content: z.string().max(20000, 'Content must be 20,000 characters or less').default(''),
  category: z.string().max(100, 'Category must be 100 characters or less').default('General'),
  isPinned: z.boolean().default(false),
});

type NoteBody = z.infer<typeof noteBodySchema>;

function getAuthenticatedUser(req: Request): User {
  const user = (req as AuthenticatedRequest).user;

  if (!user) {
    throw new HttpError(401, 'Authentication required', 'Unauthorized');
  }

  return user;
}

export async function getNotes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = getAuthenticatedUser(req);
    const notes = await listNotes(user.id);

    res.status(200).json({ notes });
  } catch (error) {
    next(error);
  }
}

export async function postNote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = getAuthenticatedUser(req);
    const body = noteBodySchema.parse(req.body) as NoteBody;
    const note = await createNote(user.id, body);

    res.status(201).json({ note });
  } catch (error) {
    next(error);
  }
}

export async function putNote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = getAuthenticatedUser(req);
    const body = noteBodySchema.parse(req.body) as NoteBody;
    const note = await updateNote(user.id, req.params.id, body);

    res.status(200).json({ note });
  } catch (error) {
    next(error);
  }
}

export async function deleteNoteById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = getAuthenticatedUser(req);
    await deleteNote(user.id, req.params.id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}