import { NextFunction, Response } from 'express';
import createHttpError from 'http-errors';
import { StatusCodes } from 'http-status-codes';
import { Logger } from 'winston';

import { AuthService } from '../services/AuthService';
import { CredentialService } from '../services/CredentialService';
import { UserService } from '../services/UserService';
import { AuthRequest, RegisterUserRequest } from '../types';

export class UserController {
    constructor(
        private userService: UserService,
        private authService: AuthService,
        private credentialService: CredentialService,
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
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });

            this.logger.info('User has been registered', { id: user.id });

            const payload = {
                sub: String(user.id),
                role: user.role,
                issuer: 'auth-service',
            };
            const { accessToken, refreshToken } =
                await this.authService.generateTokens(payload, user);

            this.authService.setAuthCookies(res, accessToken, refreshToken);

            res.status(StatusCodes.CREATED).json({
                id: user.id,
            });
        } catch (error) {
            next(error);
            return;
        }
    }

    async login(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        const { email, password } = req.body;
        this.logger.debug('User Controller :: New request to login a user: ', {
            email,
            password: '******',
        });

        try {
            // todo: check if username (email) exists in database
            const user = await this.userService.findByEmail(email);
            if (!user) {
                next(
                    createHttpError(
                        StatusCodes.UNAUTHORIZED,
                        'Email or Password does not match',
                    ),
                );
                return;
            }

            // todo: compare password
            const passwordMatch = await this.credentialService.comparePassword(
                password,
                user.password,
            );
            if (!passwordMatch) {
                next(
                    createHttpError(
                        StatusCodes.UNAUTHORIZED,
                        'Email or Password does not match',
                    ),
                );
                return;
            }

            const payload = {
                sub: String(user.id),
                role: user.role,
                issuer: 'auth-service',
            };

            // todo: generate tokens
            const { accessToken, refreshToken } =
                await this.authService.generateTokens(payload, user);

            // todo: add tokens to cookies
            this.authService.setAuthCookies(res, accessToken, refreshToken);

            this.logger.info('User Successfully logged in', { id: user.id });

            // todo: return response (id)
            res.status(StatusCodes.OK).json({
                id: user.id,
            });
        } catch (error) {
            this.logger.error(error);
            next(error);
        }
    }

    async whoami(
        req: AuthRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        this.logger.info('User Controller :: Request for refresh token ', {
            sub: req.auth.sub,
            role: req.auth.role,
        });

        try {
            const user = await this.userService.findById(Number(req.auth.sub));
            if (!user) {
                this.logger.error(
                    `Couldn't refresh the token for ${req.auth.sub}`,
                );
                next(createHttpError(StatusCodes.NOT_FOUND, 'User not found'));
                return;
            }

            this.logger.info(
                'User Controller :: Successfull in refreshing the token',
            );
            res.status(StatusCodes.OK).json({ ...user, password: undefined });
        } catch (error) {
            this.logger.error(error);
            next(error);
        }
    }

    async refresh(
        req: AuthRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const payload = {
                sub: req.auth.sub,
                role: req.auth.role,
            };

            const user = await this.userService.findById(Number(req.auth.sub));
            if (!user) {
                next(createHttpError(StatusCodes.NOT_FOUND, 'User not found'));
                return;
            }

            const { accessToken, refreshToken } =
                await this.authService.generateTokens(payload, user);

            // delete old refresh token
            await this.authService.deleteRefreshToken(Number(req.auth.id));

            this.authService.setAuthCookies(res, accessToken, refreshToken);

            res.status(StatusCodes.OK).json({ success: true });
        } catch (error) {
            this.logger.error(error);
            next(error);
        }
    }
}
