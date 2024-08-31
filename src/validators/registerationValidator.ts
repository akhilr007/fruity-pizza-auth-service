import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { StatusCodes } from 'http-status-codes';
import { z, ZodError } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateData(schema: z.ZodObject<any>) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.errors.map((issue) => ({
                    type: 'ValidationError',
                    msg: `${issue.message}`,
                    path: issue.path.join('.'),
                    location: 'body',
                }));
                next(
                    createHttpError(
                        StatusCodes.BAD_REQUEST,
                        'Validation Error',
                        {
                            errors: errorMessages,
                        },
                    ),
                );
            } else {
                next(
                    createHttpError(
                        StatusCodes.INTERNAL_SERVER_ERROR,
                        'Internal Server Error',
                    ),
                );
            }
        }
    };
}
