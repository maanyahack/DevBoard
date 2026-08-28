// Import the Router factory from Express.
import { Router } from 'express';
// Import the controller functions that handle each HTTP method.
import { deleteNoteById, getNotes, postNote, putNote } from '../controllers/notes.controller.js';
// Import the auth middleware that protects all routes in this file.
import { requireAuth } from '../middleware/auth.middleware.js';

// Create a new Router for the /api/notes sub-path.
const router = Router();

// Apply the requireAuth middleware to ALL routes in this router.
// This means every request to /api/* must have a valid JWT token.
// This is more efficient than adding auth to each route individually.
router.use(requireAuth);

// Define the CRUD routes:
// GET    /api/notes     → list all notes (handled by getNotes)
// POST   /api/notes     → create a note (handled by postNote)
// PUT    /api/notes/:id → update a note (handled by putNote)
// DELETE /api/notes/:id → delete a note (handled by deleteNoteById)
// ':id' is a route parameter — Express puts the value in req.params.id
router.get('/', getNotes);
router.post('/', postNote);
router.put('/:id', putNote);
router.delete('/:id', deleteNoteById);

// Export the router so the main route index can mount it.
export default router;
