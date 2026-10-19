import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { aiRateLimiter } from '../middleware/rateLimiter';
import {
  getStatus,
  getRecommendations,
  getPriceEstimate,
  getEmailDraft,
  getAnalyticsSummary,
  getContentPlan,
} from '../controllers/ai.controller';

const router = Router();

// All AI endpoints require authentication and are rate limited
router.use(authenticate);
router.use(aiRateLimiter);

router.get('/status', getStatus);
router.post('/recommend', getRecommendations);
router.post('/price-estimate', getPriceEstimate);
router.post('/email-draft', getEmailDraft);
router.post('/analytics-summary', getAnalyticsSummary);
router.post('/content-plan', getContentPlan);

export default router;
