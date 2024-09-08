import { Router } from 'express';

import logger from '../../configs/logger';
import { TenantController } from '../../controllers/TenantController';
import { tenantRepository } from '../../repositories/tenant.repository';
import { TenantService } from '../../services/TenantService';

const router = Router();

const tenantService = new TenantService(tenantRepository, logger);
const tenantController = new TenantController(tenantService, logger);

router.post('/', (req, res, next) => tenantController.create(req, res, next));

export default router;
