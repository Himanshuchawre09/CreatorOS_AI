import { Router } from 'express';
import { getMyProfile, updateMyProfile } from '../controllers/profile.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/me', authenticate, getMyProfile);
router.put('/me', authenticate, updateMyProfile);

export default router;

