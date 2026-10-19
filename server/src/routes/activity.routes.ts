// Import the Router factory from Express.
import { Router } from 'express';
// Import the activity controller function.
import { getActivities } from '../controllers/activity.controller.js';
// Import auth middleware — activity feed requires authentication.
import { requireAuth } from '../middleware/auth.middleware.js';

// Create a Router for /api/activity.
const router = Router();

// Activity routes require authentication — users see only their own activities.
router.use(requireAuth);

// GET /api/activity → fetch the user's recent activity feed (up to 30 items).
router.get('/', getActivities);

export default router;
