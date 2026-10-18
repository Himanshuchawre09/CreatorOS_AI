import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getDiagnostics } from '../controllers/health.controller';

const router = Router();

// Protect all admin routes with authentication and admin role
router.use(authenticate, authorize('admin'));

// Test route: GET /api/admin/ping
router.get('/ping', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'pong',
  });
});

// Admin diagnostics: GET /api/admin/diagnostics and GET /api/admin/health
router.get('/diagnostics', getDiagnostics);
router.get('/health', getDiagnostics);

export default router;

