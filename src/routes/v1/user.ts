import { Router } from 'express';

import logger from '../../configs/logger';
import { Roles } from '../../constants';
import { AdminController } from '../../controllers/AdminController';
import authenticate from '../../middlewares/authenticate';
import { canAccess } from '../../middlewares/canAccess';
import { userRepository } from '../../repositories/user.repository';
import { UserService } from '../../services/UserService';

const router = Router();

const userService = new UserService(userRepository, logger);
const adminController = new AdminController(userService, logger);

router.post('/', authenticate, canAccess([Roles.ADMIN]), (req, res, next) =>
    adminController.create(req, res, next),
);

export default router;
