import { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Logger } from 'winston';

import { Roles } from '../constants';
import { UserService } from '../services/UserService';
import { CreateManagerRequest } from '../types';

export class AdminController {
    constructor(
        public userService: UserService,
        public logger: Logger,
    ) {}
    async create(
        req: CreateManagerRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        const { firstName, lastName, email, password } = req.body;
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role: Roles.MANAGER,
            });

            res.status(StatusCodes.CREATED).json({ id: user.id });
        } catch (error) {
            this.logger.error(error);
            next(error);
        }
    }
}
