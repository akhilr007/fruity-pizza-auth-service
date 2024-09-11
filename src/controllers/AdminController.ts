import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { StatusCodes } from 'http-status-codes';
import { Logger } from 'winston';

import { Roles } from '../constants';
import { UserService } from '../services/UserService';
import { CreateManagerRequest, UserResponse } from '../types';

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

    async findById(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        const userId = req.params.id;
        this.logger.info(
            'AdminController :: Request for getting a user with id ' + userId,
        );
        if (isNaN(Number(userId))) {
            this.logger.error('AdminController :: Invalid user id:' + userId);
            next(
                createHttpError(StatusCodes.BAD_REQUEST, 'Invalid url param.'),
            );
            return;
        }
        try {
            const user = await this.userService.findById(Number(userId));
            if (!user) {
                next(
                    createHttpError(
                        StatusCodes.NOT_FOUND,
                        'User does not exist.',
                    ),
                );
                return;
            }

            const userResponse: UserResponse = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            };
            res.status(StatusCodes.OK).json(userResponse);
        } catch (error) {
            this.logger.error(error);
            next(error);
        }
    }
}
