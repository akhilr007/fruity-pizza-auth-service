import 'reflect-metadata';

import express, { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';

import logger from './configs/logger';
import apiRouter from './routes/index';

const app = express();

app.get('/', (req: Request, res: Response) => {
    res.status(200).send('Welcome to Auth Service');
});

app.use('/api', apiRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);

    const statusCode = err.statusCode || 500;

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
});

export default app;
