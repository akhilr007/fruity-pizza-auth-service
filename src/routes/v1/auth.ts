import { Router } from 'express';

import { AppDataSource } from '../../configs/data-source';
import logger from '../../configs/logger';
import { UserController } from '../../controllers/UserController';
import { User } from '../../entity/User';
import { UserService } from '../../services/UserService';

const router = Router();

const userRepository = AppDataSource.getRepository(User);

const userService = new UserService(userRepository, logger);

const userController = new UserController(userService, logger);

router.post('/auth/register', (req, res, next) =>
    userController.register(req, res, next),
);

export default router;
