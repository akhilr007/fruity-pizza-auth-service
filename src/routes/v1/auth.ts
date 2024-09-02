import { Router } from 'express';

import logger from '../../configs/logger';
import { UserController } from '../../controllers/UserController';
import { refreshTokenRepository } from '../../repositories/refreshToken.repository';
import { userRepository } from '../../repositories/user.repository';
import { userRegistrationSchema } from '../../schemas/user-schema';
import { AuthService } from '../../services/AuthService';
import { UserService } from '../../services/UserService';
import { validateData } from '../../validators/registerationValidator';

const router = Router();

const userService = new UserService(userRepository, logger);

const authService = new AuthService(refreshTokenRepository, logger);

const userController = new UserController(userService, authService, logger);

router.post(
    '/auth/register',
    validateData(userRegistrationSchema),
    (req, res, next) => userController.register(req, res, next),
);

export default router;
