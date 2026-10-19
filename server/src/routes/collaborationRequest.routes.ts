import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createCollaborationRequest,
  getCollaborationRequests,
  getCollaborationRequestById,
  respondToRequest,
  withdrawRequest,
} from '../controllers/collaborationRequest.controller';

const router = Router();

// All collaboration request routes require authentication
router.use(authenticate);

// List requests (inbox/outbox/all)
router.get('/', getCollaborationRequests);

// Create request (brand->creator or creator->brand)
router.post('/', createCollaborationRequest);

// Get request by ID
router.get('/:id', getCollaborationRequestById);

// Respond to request (accept/reject - recipient only)
router.put('/:id/respond', respondToRequest);

// Withdraw request (sender only)
router.put('/:id/withdraw', withdrawRequest);

export default router;
