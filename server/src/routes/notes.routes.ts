import { Router } from 'express';
import { deleteNoteById, getNotes, postNote, putNote } from '../controllers/notes.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', getNotes);
router.post('/', postNote);
router.put('/:id', putNote);
router.delete('/:id', deleteNoteById);

export default router;