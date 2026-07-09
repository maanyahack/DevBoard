import { Router } from 'express';
import healthRoutes from './health.routes.js';
import notesRoutes from './notes.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/notes', notesRoutes);

export default router;
