import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  inviteCreator,
  getTalentLinks,
  respondToInvite,
  deleteTalentLink,
} from '../controllers/talentLink.controller';

const router = Router();

router.use(authenticate);

router.post('/invite', inviteCreator);
router.get('/', getTalentLinks);
router.put('/:id/respond', respondToInvite);
router.delete('/:id', deleteTalentLink);

export default router;
