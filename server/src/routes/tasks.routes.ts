// Import the Router factory from Express.
import { Router } from 'express';
// Import all task controller functions — tasks have more endpoints than other modules.
import {
  deleteTaskById,
  getTasks,
  patchTaskStatus,      // PATCH for partial updates (status only)
  patchTasksReorder,    // PATCH for bulk reorder operations
  postSuggestTask,      // POST for AI task suggestion
  postTask,
  putTask,
} from '../controllers/tasks.controller.js';
// Import auth middleware for route protection.
import { requireAuth } from '../middleware/auth.middleware.js';

// Create a new Router for /api/tasks sub-path.
const router = Router();

// Protect all task routes — must be authenticated.
router.use(requireAuth);

// CRUD routes:
// GET    /api/tasks              → list tasks (with optional filters)
// POST   /api/tasks              → create a task
// PUT    /api/tasks/:id          → full update of a task
// DELETE /api/tasks/:id          → delete a task
//
// Additional task-specific routes:
// POST   /api/tasks/suggest      → AI generates a task from natural language
// PATCH  /api/tasks/reorder      → bulk update task positions (Kanban drag-and-drop)
// PATCH  /api/tasks/:id/status   → quick status-only update (move between columns)
//
// IMPORTANT: '/suggest' and '/reorder' are defined BEFORE '/:id'
// because Express matches routes top-down. If '/:id' came first,
// 'suggest' and 'reorder' would be captured as IDs.
router.get('/', getTasks);
router.post('/', postTask);
router.post('/suggest', postSuggestTask);     // AI task suggestion
router.patch('/reorder', patchTasksReorder);  // Bulk reorder
router.patch('/:id/status', patchTaskStatus); // Status-only update
router.put('/:id', putTask);
router.delete('/:id', deleteTaskById);

export default router;
