import { Router } from 'express';
import { getDashboardData, getDashboardInsights } from '../controllers/dashboard.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', getDashboardData);
router.get('/insights', getDashboardInsights);

export default router;
