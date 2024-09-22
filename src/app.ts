import 'reflect-metadata';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';

import { Config } from './configs';
import { globalErrorHandler } from './middlewares/globalErrorHandler';
import apiRouter from './routes/index';

const app = express();
const FRONTEND_URL = Config.FRONTEND_URL || '';

/* middlewares */
app.use(
    cors({
        origin: [FRONTEND_URL],
        credentials: true,
    }),
);
app.use(express.static('public'));
app.use(cookieParser());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.status(200).send('Welcome to Auth Service');
});

app.use('/api', apiRouter);

app.use(globalErrorHandler);

export default app;
