import { Router } from 'express';
import { getGlobalSearch } from '../controllers/search.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', getGlobalSearch);

export default router;
