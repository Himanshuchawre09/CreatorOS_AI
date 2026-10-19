import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import profileRoutes from './profile.routes';
import creatorRoutes from './creator.routes';
import brandRoutes from './brand.routes';
import portfolioRoutes from './portfolio.routes';
import campaignRoutes from './campaign.routes';
import collaborationRequestRoutes from './collaborationRequest.routes';
import contractRoutes from './contract.routes';
import taskRoutes from './task.routes';
import submissionRoutes from './submission.routes';
import aiRoutes from './ai.routes';
import dashboardRoutes from './dashboard.routes';
import talentLinkRoutes from './talentLink.routes';
import notificationRoutes from './notification.routes';
import messageRoutes from './message.routes';
import invoiceRoutes from './invoice.routes';

const apiRouter = Router();

// Mount route modules
apiRouter.use('/auth', authRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/profile', profileRoutes);
apiRouter.use('/creators', creatorRoutes);
apiRouter.use('/brands', brandRoutes);
apiRouter.use('/portfolio', portfolioRoutes);
apiRouter.use('/campaigns', campaignRoutes);
apiRouter.use('/collaboration-requests', collaborationRequestRoutes);
apiRouter.use('/requests', collaborationRequestRoutes);
apiRouter.use('/contracts', contractRoutes);
apiRouter.use('/tasks', taskRoutes);
apiRouter.use('/submissions', submissionRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/talent-links', talentLinkRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/messages', messageRoutes);
apiRouter.use('/invoices', invoiceRoutes);
apiRouter.use('/', healthRoutes);

export default apiRouter;
