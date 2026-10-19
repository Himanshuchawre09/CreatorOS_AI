import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getContracts,
  getContractById,
  updateContract,
  sendContract,
  signContract,
  declineContract,
} from '../controllers/contract.controller';

const router = Router();

router.use(authenticate);

router.get('/', getContracts);
router.get('/:id', getContractById);
router.put('/:id', updateContract);
router.put('/:id/send', sendContract);
router.put('/:id/sign', signContract);
router.put('/:id/decline', declineContract);

export default router;
