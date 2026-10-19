import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createReview,
  getReviewsForUser,
  getReviewsForCollaboration,
} from '../controllers/review.controller';

const router = Router();

// Public user review list
router.get('/user/:userId', getReviewsForUser);

// Protected routes
router.use(authenticate);
router.post('/', createReview);
router.get('/collaboration/:collaborationId', getReviewsForCollaboration);

export default router;
