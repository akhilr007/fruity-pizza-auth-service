import { Router } from 'express';

import logger from '../../configs/logger';
import { Roles } from '../../constants';
import { TenantController } from '../../controllers/TenantController';
import authenticate from '../../middlewares/authenticate';
import { canAccess } from '../../middlewares/canAccess';
import { tenantRepository } from '../../repositories/tenant.repository';
import { tenantSchema } from '../../schemas/tenant-schema';
import { TenantService } from '../../services/TenantService';
import { validateData } from '../../validators/validateData';

const router = Router();

const tenantService = new TenantService(tenantRepository, logger);
const tenantController = new TenantController(tenantService, logger);

router.post(
    '/',
    authenticate,
    canAccess([Roles.ADMIN]),
    validateData(tenantSchema),
    (req, res, next) => tenantController.create(req, res, next),
);

router.patch(
    '/:id',
    authenticate,
    canAccess([Roles.ADMIN]),
    validateData(tenantSchema),
    (req, res, next) => tenantController.update(req, res, next),
);

router.get('/:id', authenticate, canAccess([Roles.ADMIN]), (req, res, next) =>
    tenantController.findById(req, res, next),
);

export default router;
