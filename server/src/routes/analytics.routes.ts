import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  upsertAnalytics,
  getAnalyticsByCollaboration,
  getUserAnalyticsSummary,
} from '../controllers/analytics.controller';

const router = Router();

router.use(authenticate);

router.get('/', getUserAnalyticsSummary);
router.post('/', upsertAnalytics);
router.get('/:collaborationId', getAnalyticsByCollaboration);

export default router;
