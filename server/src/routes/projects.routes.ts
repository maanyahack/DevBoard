// Import the Router factory from Express.
import { Router } from 'express';
// Import project controller functions for CRUD operations.
import {
  deleteProjectById,
  getProjects,
  postProject,
  putProject,
} from '../controllers/projects.controller.js';
// Import auth middleware.
import { requireAuth } from '../middleware/auth.middleware.js';

// Create a Router for /api/projects.
const router = Router();

// All project routes require authentication.
router.use(requireAuth);

// Standard CRUD routes:
// GET    /api/projects     → list all projects
// POST   /api/projects     → create a project
// PUT    /api/projects/:id → update a project
// DELETE /api/projects/:id → delete a project
router.get('/', getProjects);
router.post('/', postProject);
router.put('/:id', putProject);
router.delete('/:id', deleteProjectById);

export default router;
