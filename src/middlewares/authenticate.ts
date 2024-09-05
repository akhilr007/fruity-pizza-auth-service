import { Request } from 'express';
import { expressjwt, GetVerificationKey } from 'express-jwt';
import jwksClient from 'jwks-rsa';

import { Config } from '../configs';

export default expressjwt({
    secret: jwksClient.expressJwtSecret({
        jwksUri: Config.JWKS_URI || '',
        cache: true,
        rateLimit: true,
    }) as GetVerificationKey,
    algorithms: ['RS256'],
    getToken(req: Request) {
        const authHeader = req.headers.authorization;
        // Bearer <token_value>
        if (authHeader && authHeader.split(' ')[1] !== 'undefined') {
            const token = authHeader.split(' ')[1];
            if (token) {
                return token;
            }
        }

        const { accessToken } = req.cookies;
        return accessToken;
    },
});
