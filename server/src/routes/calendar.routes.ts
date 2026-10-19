import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
} from '../controllers/calendar.controller';

const router = Router();

router.use(authenticate);

router.get('/', getPosts);
router.post('/', createPost);
router.get('/:id', getPostById);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);

export default router;
