import { Router } from 'express';
import {
  deleteTaskById,
  getTasks,
  patchTaskStatus,
  patchTasksReorder,
  postSuggestTask,
  postTask,
  putTask,
} from '../controllers/tasks.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', getTasks);
router.post('/', postTask);
router.post('/suggest', postSuggestTask);
router.patch('/reorder', patchTasksReorder);
router.patch('/:id/status', patchTaskStatus);
router.put('/:id', putTask);
router.delete('/:id', deleteTaskById);

export default router;
