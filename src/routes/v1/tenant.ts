import { Router } from 'express';

import logger from '../../configs/logger';
import { TenantController } from '../../controllers/TenantController';
import authenticate from '../../middlewares/authenticate';
import { tenantRepository } from '../../repositories/tenant.repository';
import { tenantSchema } from '../../schemas/tenant-schema';
import { TenantService } from '../../services/TenantService';
import { validateData } from '../../validators/validateData';

const router = Router();

const tenantService = new TenantService(tenantRepository, logger);
const tenantController = new TenantController(tenantService, logger);

router.post('/', authenticate, validateData(tenantSchema), (req, res, next) =>
    tenantController.create(req, res, next),
);

export default router;
