import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus,
} from '../controllers/invoice.controller';

const router = Router();

router.use(authenticate);

router.get('/', getInvoices);
router.post('/', createInvoice);
router.get('/:id', getInvoiceById);
router.put('/:id/status', updateInvoiceStatus);

export default router;
