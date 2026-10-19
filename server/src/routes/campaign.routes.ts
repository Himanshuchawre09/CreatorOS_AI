import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
} from '../controllers/campaign.controller';

const router = Router();

// All campaign routes require authentication
router.use(authenticate);

// List campaigns (brand sees own; creator/freelancer sees open)
router.get('/', getCampaigns);

// Create campaign (brand only)
router.post('/', authorize('brand'), createCampaign);

// Get campaign by id
router.get('/:id', getCampaignById);

// Update campaign (brand only, owner-verified)
router.put('/:id', authorize('brand'), updateCampaign);

// Delete or cancel campaign (brand only, owner-verified)
router.delete('/:id', authorize('brand'), deleteCampaign);

export default router;
