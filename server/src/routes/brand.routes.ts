import { Router } from 'express';
import { getBrands, getBrandById } from '../controllers/brand.controller';
import { optionalAuthenticate } from '../middleware/auth';

const router = Router();

router.get('/', getBrands);
router.get('/:id', optionalAuthenticate, getBrandById);

export default router;
