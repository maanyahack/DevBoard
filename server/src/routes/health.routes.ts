// Import the Router factory from Express.
import { Router } from 'express';
// Import the health controller.
import { getHealth } from '../controllers/health.controller.js';

// Create a Router for /api/health.
const router = Router();

// NOTE: No requireAuth middleware here — the health check is public.
// This is intentional: load balancers and monitoring tools need to
// check if the server is alive without providing authentication.

// GET /api/health → returns server status, service name, and timestamp.
router.get('/', getHealth);

export default router;
