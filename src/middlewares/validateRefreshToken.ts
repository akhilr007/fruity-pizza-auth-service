import { Request } from 'express';
import { expressjwt } from 'express-jwt';

import { Config } from '../configs';
import { AppDataSource } from '../configs/data-source';
import logger from '../configs/logger';
import { RefreshToken } from '../entity/RefreshToken';

interface IRefreshTokenPayload {
    id: string;
}

export default expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET || '',
    algorithms: ['HS256'],
    getToken(req: Request) {
        const { refreshToken } = req.cookies;
        return refreshToken;
    },
    async isRevoked(request: Request, token) {
        try {
            const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
            const refreshToken = await refreshTokenRepo.findOne({
                where: {
                    id: Number((token?.payload as IRefreshTokenPayload).id),
                    user: { id: Number(token?.payload.sub) },
                },
            });
            return refreshToken === null;
        } catch (error) {
            logger.error(
                `${error} : ${(token?.payload as IRefreshTokenPayload).id}`,
            );
        }
        return true;
    },
});
