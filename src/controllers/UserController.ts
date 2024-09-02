import { NextFunction, Response } from 'express';
import fs from 'fs';
import createHttpError from 'http-errors';
import { StatusCodes } from 'http-status-codes';
import jwt, { JwtPayload } from 'jsonwebtoken';
import path from 'path';
import { Logger } from 'winston';

import { Config } from '../configs';
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

            let privateKey: Buffer = Buffer.from('');
            try {
                privateKey = fs.readFileSync(
                    path.join(__dirname, '../../certs/private.pem'),
                );
            } catch (error) {
                this.logger.error(
                    'Error while generating private key: ',
                    error,
                );
                next(
                    createHttpError(
                        StatusCodes.INTERNAL_SERVER_ERROR,
                        'error while reading private key',
                    ),
                );
            }

            const payload: JwtPayload = {
                sub: String(response.id),
                role: response.role,
            };

            const accessToken = jwt.sign(payload, privateKey, {
                algorithm: 'RS256',
                expiresIn: '1h',
                issuer: 'auth-service',
            });

            const refreshTokenSecret: string =
                Config.REFRESH_TOKEN_SECRET || 'my-secret';
            const refreshToken = jwt.sign(payload, refreshTokenSecret, {
                algorithm: 'HS256',
                expiresIn: '1y',
                issuer: 'auth-service',
            });

            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60, // 1 hour
                httpOnly: true,
            });

            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365, // 365 day
                httpOnly: true,
            });

            res.status(StatusCodes.CREATED).json({
                id: response.id,
            });
        } catch (error) {
            next(error);
            return;
        }
    }
}
