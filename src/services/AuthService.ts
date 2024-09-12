import { Response } from 'express';
import createHttpError from 'http-errors';
import { StatusCodes } from 'http-status-codes';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { Logger } from 'winston';

import { Config } from '../configs';
import { RefreshToken } from '../entity/RefreshToken';
import { User } from '../entity/User';

export class AuthService {
    constructor(
        private refreshTokenRepository: Repository<RefreshToken>,
        private logger: Logger,
    ) {}

    private getPrivateKey(): string {
        const privateKey = Config.PRIVATE_KEY;
        if (!privateKey) {
            throw createHttpError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                'PRIVATE_KEY IS NOT SET',
            );
        }
        try {
            return privateKey.replace(/\\n/g, '\n');
        } catch (error) {
            this.logger.error('Error while generating private key: ', error);
            throw createHttpError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                'error while reading private key',
            );
        }
    }

    private generateAccessToken(payload: JwtPayload): string {
        const privateKey = this.getPrivateKey();
        return jwt.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '1h',
        });
    }

    private async generateRefreshToken(payload: JwtPayload): Promise<string> {
        const refreshTokenSecret = Config.REFRESH_TOKEN_SECRET || 'my-secret';

        return jwt.sign(payload, refreshTokenSecret, {
            algorithm: 'HS256',
            expiresIn: '1y',
            jwtid: String(payload.id),
        });
    }

    async generateTokens(
        payload: JwtPayload,
        user: User,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const accessToken = this.generateAccessToken(payload);

        // Persist refresh token in database
        const newRefreshToken = await this.saveInDb(user);
        const refreshToken = await this.generateRefreshToken({
            ...payload,
            id: String(newRefreshToken.id),
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

    async saveInDb(user: User): Promise<RefreshToken> {
        const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;
        return this.refreshTokenRepository.save({
            user: user,
            expiresAt: new Date(Date.now() + MS_IN_YEAR),
        });
    }

    async deleteRefreshToken(tokenId: number): Promise<void> {
        this.refreshTokenRepository.delete({ id: tokenId });
    }
}
