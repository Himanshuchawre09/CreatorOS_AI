import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { uploadDeliverable } from '../utils/upload';
import {
  createSubmission,
  submitRevision,
  reviewSubmission,
  getSubmissions,
  getSubmissionById,
  downloadSubmissionFile,
} from '../controllers/submission.controller';

const router = Router();

router.use(authenticate);

router.get('/', getSubmissions);
router.post('/', uploadDeliverable.single('file'), createSubmission);
router.get('/:id', getSubmissionById);
router.post('/:id/revision', uploadDeliverable.single('file'), submitRevision);
router.put('/:id/review', reviewSubmission);
router.get('/:id/file', downloadSubmissionFile);

export default router;
