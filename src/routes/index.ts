import { Router } from 'express';

import v1AuthRouter from './v1/auth';
import v1TenantRouter from './v1/tenant';

const router = Router();

router.use('/v1/auth', v1AuthRouter);
router.use('/v1/tenants', v1TenantRouter);

export default router;
