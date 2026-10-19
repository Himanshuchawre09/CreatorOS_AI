import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/task.controller';

const router = Router();

router.use(authenticate);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
