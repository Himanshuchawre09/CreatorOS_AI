import { Router } from 'express';
import {
  getMyPortfolio,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
} from '../controllers/portfolio.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/me', getMyPortfolio);
router.post('/', createPortfolioItem);
router.put('/:id', updatePortfolioItem);
router.delete('/:id', deletePortfolioItem);

export default router;
