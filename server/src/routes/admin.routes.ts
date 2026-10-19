import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getDiagnostics } from '../controllers/health.controller';
import {
  listUsers,
  updateUserStatus,
  getPlatformStats,
  updateProfileVisibility,
} from '../controllers/admin.controller';

const router = Router();

// Protect all admin routes with authentication and admin role
router.use(authenticate, authorize('admin'));

// Test route
router.get('/ping', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'pong',
  });
});

// Admin diagnostics
router.get('/diagnostics', getDiagnostics);
router.get('/health', getDiagnostics);

// User management & platform metrics
router.get('/users', listUsers);
router.put('/users/:id/status', updateUserStatus);
router.get('/platform-stats', getPlatformStats);
router.put('/profiles/:type/:id/visibility', updateProfileVisibility);

export default router;
