import 'reflect-metadata';

import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import { StatusCodes } from 'http-status-codes';

import logger from './configs/logger';
import apiRouter from './routes/index';

const app = express();

app.use(express.static('public'));
app.use(cookieParser());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.status(200).send('Welcome to Auth Service');
});

app.use('/api', apiRouter);

app.use(
    (
        err: HttpError & { errors?: never[] },
        req: Request,
        res: Response,

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _next: NextFunction,
    ) => {
        logger.error(err.message);

        const statusCode =
            err.statusCode || err.status || StatusCodes.INTERNAL_SERVER_ERROR;

        if (err.errors) {
            logger.error(err.errors);
            return res.status(statusCode).json({ errors: err.errors });
        }

        res.status(statusCode).json({
            errors: [
                {
                    type: err.name,
                    msg: err.message,
                    path: '',
                    location: '',
                },
            ],
        });
    },
);

export default app;
