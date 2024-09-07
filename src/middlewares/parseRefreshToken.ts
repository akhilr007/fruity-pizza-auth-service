import { Request } from 'express';
import { expressjwt } from 'express-jwt';

import { Config } from '../configs';

export default expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET || '',
    algorithms: ['HS256'],
    getToken(req: Request) {
        const { refreshToken } = req.cookies;
        return refreshToken;
    },
});
