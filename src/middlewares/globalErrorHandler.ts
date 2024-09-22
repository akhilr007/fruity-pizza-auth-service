import { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';

import logger from '../configs/logger';

export const globalErrorHandler = (
    err: HttpError & { errors?: never[] },
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction,
) => {
    const errorId = uuidv4();
    const statusCode = err.status || StatusCodes.INTERNAL_SERVER_ERROR;

    const isProduction = process.env.NODE_ENV === 'production';
    const message = isProduction ? 'Internal Server Error' : err.message;

    logger.error(err.message, {
        id: errorId,
        statusCode: statusCode,
        error: err.stack,
        path: req.path,
        method: req.method,
    });

    res.status(statusCode).json({
        errors: [
            {
                ref: errorId,
                type: err.name,
                msg: message,
                path: req.path,
                method: req.method,
                location: 'server',
                stack: isProduction ? null : err.stack,
            },
        ],
    });
};
