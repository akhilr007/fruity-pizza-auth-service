import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { StatusCodes } from 'http-status-codes';
import { Logger } from 'winston';

import { Roles } from '../constants';
import { UserService } from '../services/UserService';
import {
    CreateManagerRequest,
    UpdateUserRequest,
    UserResponse,
} from '../types';

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

    async findAll(req: Request, res: Response, next: NextFunction) {
        this.logger.info('AdminController :: Request to get all users');
        try {
            const users: UserResponse[] = await this.userService.findAll();
            res.status(StatusCodes.OK).json(users);
        } catch (error) {
            this.logger.error(error);
            next(error);
        }
    }

    async deleteById(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.id;

        this.logger.info(
            'AdminController :: Request to delete user with id: ' + userId,
        );

        if (isNaN(Number(userId))) {
            this.logger.error('AdminController :: Invalid user id:' + userId);
            next(
                createHttpError(StatusCodes.BAD_REQUEST, 'Invalid url param.'),
            );
            return;
        }

        try {
            await this.userService.deleteById(Number(userId));

            this.logger.info(
                'AdminController :: Successfully deleted user with id: ' +
                    userId,
            );

            res.status(StatusCodes.OK).json({ success: true, id: userId });
        } catch (error) {
            this.logger.error(error);
            next(error);
        }
    }

    async update(req: UpdateUserRequest, res: Response, next: NextFunction) {
        const userId = req.params.id;

        this.logger.info(
            'AdminController :: Request to update user with id: ' + userId,
        );

        if (isNaN(Number(userId))) {
            this.logger.error('AdminController :: Invalid user id:' + userId);
            next(
                createHttpError(StatusCodes.BAD_REQUEST, 'Invalid url param.'),
            );
            return;
        }

        const { firstName, lastName, email, role, tenantId } = req.body;
        try {
            await this.userService.update(Number(userId), {
                firstName,
                lastName,
                email,
                role,
                tenantId,
            });

            this.logger.info('TenantController :: User has been updated', {
                id: userId,
            });

            res.status(StatusCodes.OK).json({ id: Number(userId) });
        } catch (error) {
            this.logger.error(error);
            next(error);
        }
    }
}
