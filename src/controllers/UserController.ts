import { NextFunction, Response } from 'express';
import { Logger } from 'winston';

import { UserService } from '../services/UserService';
import { RegisterUserRequest } from '../types';

export class UserController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        const { firstName, lastName, email, password } = req.body;
        this.logger.debug(
            'User Controller :: New request to register a user: ',
            {
                firstName,
                lastName,
                email,
                password: '******',
            },
        );

        try {
            const response = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });
            this.logger.info('User has been registered', { id: response.id });
            res.status(201).json({
                id: response.id,
            });
        } catch (error) {
            next(error);
            return;
        }
    }
}
