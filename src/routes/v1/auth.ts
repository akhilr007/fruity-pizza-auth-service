import { Router } from 'express';

import logger from '../../configs/logger';
import { UserController } from '../../controllers/UserController';
import authenticate from '../../middlewares/authenticate';
import parseRefreshToken from '../../middlewares/parseRefreshToken';
import validateRefreshToken from '../../middlewares/validateRefreshToken';
import { refreshTokenRepository } from '../../repositories/refreshToken.repository';
import { userRepository } from '../../repositories/user.repository';
import {
    userLoginSchema,
    userRegistrationSchema,
} from '../../schemas/user-schema';
import { AuthService } from '../../services/AuthService';
import { CredentialService } from '../../services/CredentialService';
import { UserService } from '../../services/UserService';
import { AuthRequest } from '../../types';
import { validateData } from '../../validators/validateData';

const router = Router();

const userService = new UserService(userRepository, logger);

const authService = new AuthService(refreshTokenRepository, logger);

const credentialService = new CredentialService();

const userController = new UserController(
    userService,
    authService,
    credentialService,
    logger,
);

router.post(
    '/register',
    validateData(userRegistrationSchema),
    (req, res, next) => userController.register(req, res, next),
);

router.post('/login', validateData(userLoginSchema), (req, res, next) =>
    userController.login(req, res, next),
);

router.get('/whoami', authenticate, (req, res, next) =>
    userController.whoami(req as AuthRequest, res, next),
);

router.post('/refresh', validateRefreshToken, (req, res, next) =>
    userController.refresh(req as AuthRequest, res, next),
);

router.post('/logout', authenticate, parseRefreshToken, (req, res, next) =>
    userController.logout(req as AuthRequest, res, next),
);

export default router;
