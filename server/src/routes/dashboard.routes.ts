// Import the Router factory from Express.
import { Router } from 'express';
// Import dashboard controller functions — data aggregation and AI insights.
import { getDashboardData, getDashboardInsights } from '../controllers/dashboard.controller.js';
// Import auth middleware.
import { requireAuth } from '../middleware/auth.middleware.js';

// Create a Router for /api/dashboard.
const router = Router();

// All dashboard routes require authentication.
router.use(requireAuth);

// Two dashboard endpoints:
// GET /api/dashboard         → returns stats, recent items, activity feed (aggregate endpoint)
// GET /api/dashboard/insights → returns AI-generated productivity insights (calls Gemini)
//
// '/insights' is defined BEFORE '/' wouldn't matter here since '/' matches
// both, but it's good practice to be explicit about specific routes.
router.get('/', getDashboardData);
router.get('/insights', getDashboardInsights);

export default router;
