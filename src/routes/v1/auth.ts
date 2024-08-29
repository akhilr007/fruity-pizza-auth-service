import { Router } from 'express';

import { AppDataSource } from '../../configs/data-source';
import { UserController } from '../../controllers/UserController';
import { User } from '../../entity/User';
import { UserService } from '../../services/UserService';

const router = Router();

const userRepository = AppDataSource.getRepository(User);

const userService = new UserService(userRepository);

const userController = new UserController(userService);

router.post('/auth/register', (req, res) => userController.register(req, res));

export default router;
