import { Router } from 'express';
import {
  deleteProjectById,
  getProjects,
  postProject,
  putProject,
} from '../controllers/projects.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', getProjects);
router.post('/', postProject);
router.put('/:id', putProject);
router.delete('/:id', deleteProjectById);

export default router;
