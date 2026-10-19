import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getMessages,
  createMessage,
  getConversations,
} from '../controllers/message.controller';

const router = Router();

router.use(authenticate);

router.get('/conversations', getConversations);
router.get('/', getMessages);
router.post('/', createMessage);

export default router;
