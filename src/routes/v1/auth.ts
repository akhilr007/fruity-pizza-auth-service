import { Router } from 'express';

import { AppDataSource } from '../../configs/data-source';
import logger from '../../configs/logger';
import { UserController } from '../../controllers/UserController';
import { User } from '../../entity/User';
import { userRegistrationSchema } from '../../schemas/user-schema';
import { UserService } from '../../services/UserService';
import { validateData } from '../../validators/registerationValidator';

const router = Router();

const userRepository = AppDataSource.getRepository(User);

const userService = new UserService(userRepository, logger);

const userController = new UserController(userService, logger);

router.post(
    '/auth/register',
    validateData(userRegistrationSchema),
    (req, res, next) => userController.register(req, res, next),
);

export default router;
