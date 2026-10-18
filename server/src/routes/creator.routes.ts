import { Router } from 'express';
import { getCreators, getCreatorById } from '../controllers/creator.controller';
import { optionalAuthenticate } from '../middleware/auth';

const router = Router();

router.get('/', getCreators);
router.get('/:id', optionalAuthenticate, getCreatorById);

export default router;
