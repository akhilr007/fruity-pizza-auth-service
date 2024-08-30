import { Response } from 'express';

import { UserService } from '../services/UserService';
import { RegisterUserRequest } from '../types';

export class UserController {
    constructor(private userService: UserService) {
        this.userService = userService;
    }

    async register(req: RegisterUserRequest, res: Response) {
        const { firstName, lastName, email, password } = req.body;
        const response = await this.userService.create({
            firstName,
            lastName,
            email,
            password,
        });
        res.status(201).json({
            id: response.id,
        });
    }
}
