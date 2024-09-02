import { Response } from 'express';
import fs from 'fs';
import createHttpError from 'http-errors';
import { StatusCodes } from 'http-status-codes';
import jwt, { JwtPayload } from 'jsonwebtoken';
import path from 'path';
import { Repository } from 'typeorm';
import { Logger } from 'winston';

import { Config } from '../configs';
import { AppDataSource } from '../configs/data-source';
import { RefreshToken } from '../entity/RefreshToken';
import { User } from '../entity/User';

export class AuthService {
    constructor(private logger: Logger) {}

    private getPrivateKey(): Buffer {
        try {
            return fs.readFileSync(
                path.join(__dirname, '../../certs/private.pem'),
            );
        } catch (error) {
            this.logger.error('Error while generating private key: ', error);
            throw createHttpError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                'error while reading private key',
            );
        }
    }

    async generateTokens(
        user: User,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const privateKey = this.getPrivateKey();

        const payload: JwtPayload = {
            sub: String(user.id),
            role: user.role,
        };

        const accessToken = jwt.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '1h',
            issuer: 'auth-service',
        });

        // Persist refresh token in database
        const refreshTokenRepository: Repository<RefreshToken> =
            AppDataSource.getRepository('RefreshToken');
        const newRefreshToken = await this.saveInDb(
            refreshTokenRepository,
            user,
        );

        const refreshTokenSecret: string =
            Config.REFRESH_TOKEN_SECRET || 'my-secret';

        const refreshToken = jwt.sign(payload, refreshTokenSecret, {
            algorithm: 'HS256',
            expiresIn: '1y',
            issuer: 'auth-service',
            jwtid: String(newRefreshToken.id),
        });

        return { accessToken, refreshToken };
    }

    setAuthCookies(
        res: Response,
        accessToken: string,
        refreshToken: string,
    ): void {
        res.cookie('accessToken', accessToken, {
            domain: 'localhost',
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60, // 1 hour
            httpOnly: true,
        });

        res.cookie('refreshToken', refreshToken, {
            domain: 'localhost',
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
            httpOnly: true,
        });
    }

    async saveInDb(
        refreshTokenRepository: Repository<RefreshToken>,
        user: User,
    ): Promise<RefreshToken> {
        const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;
        const newRefreshToken = refreshTokenRepository.save({
            user: user,
            expiresAt: new Date(Date.now() + MS_IN_YEAR),
        });
        return newRefreshToken;
    }
}
