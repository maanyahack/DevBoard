import { Router } from 'express';
import dashboardRoutes from './dashboard.routes.js';
import healthRoutes from './health.routes.js';
import notesRoutes from './notes.routes.js';
import projectsRoutes from './projects.routes.js';
import tasksRoutes from './tasks.routes.js';

const router = Router();

router.use('/dashboard', dashboardRoutes);
router.use('/health', healthRoutes);
router.use('/notes', notesRoutes);
router.use('/projects', projectsRoutes);
router.use('/tasks', tasksRoutes);

export default router;
