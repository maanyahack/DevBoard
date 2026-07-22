import { Router } from 'express';
import activityRoutes from './activity.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import healthRoutes from './health.routes.js';
import notesRoutes from './notes.routes.js';
import projectsRoutes from './projects.routes.js';
import searchRoutes from './search.routes.js';
import tasksRoutes from './tasks.routes.js';

const router = Router();

router.use('/activity', activityRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/health', healthRoutes);
router.use('/notes', notesRoutes);
router.use('/projects', projectsRoutes);
router.use('/search', searchRoutes);
router.use('/tasks', tasksRoutes);

export default router;
