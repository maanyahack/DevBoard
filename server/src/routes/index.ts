// Import the Router factory from Express — creates a mini Express app
// that handles routing independently (then mounted in the main app).
import { Router } from 'express';

// Import all individual route modules — each handles one domain (notes, tasks, etc.).
import activityRoutes from './activity.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import healthRoutes from './health.routes.js';
import notesRoutes from './notes.routes.js';
import projectsRoutes from './projects.routes.js';
import searchRoutes from './search.routes.js';
import tasksRoutes from './tasks.routes.js';

// Create a new Router instance.
const router = Router();

// Mount each route module under its own path prefix.
// For example: router.use('/notes', notesRoutes) means:
// Any request to /api/notes/* is handled by notesRoutes.
// (The /api prefix is added by the main app.ts when it mounts this router.)

router.use('/activity', activityRoutes);    // /api/activity
router.use('/dashboard', dashboardRoutes);  // /api/dashboard
router.use('/health', healthRoutes);        // /api/health (no auth required)
router.use('/notes', notesRoutes);          // /api/notes
router.use('/projects', projectsRoutes);    // /api/projects
router.use('/search', searchRoutes);        // /api/search
router.use('/tasks', tasksRoutes);          // /api/tasks

// Export this router so app.ts can mount it under the /api prefix.
export default router;
