// Import the Router factory from Express.
import { Router } from 'express';
// Import the search controller function.
import { getGlobalSearch } from '../controllers/search.controller.js';
// Import auth middleware — search requires authentication.
import { requireAuth } from '../middleware/auth.middleware.js';

// Create a Router for /api/search.
const router = Router();

// Search requires authentication — users can only search their own data.
router.use(requireAuth);

// GET /api/search?q=term → global search across all modules.
router.get('/', getGlobalSearch);

export default router;
