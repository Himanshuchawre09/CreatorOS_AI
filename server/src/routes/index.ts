import { Router } from 'express';
import healthRoutes from './health.routes';

const apiRouter = Router();

// Mount route modules
apiRouter.use('/', healthRoutes);

export default apiRouter;
