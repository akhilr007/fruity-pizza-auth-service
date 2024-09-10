import { NextFunction, Request, Response } from 'express';
import createHttpError, { HttpError } from 'http-errors';
import { StatusCodes } from 'http-status-codes';
import { z, ZodError } from 'zod';

export function validateData(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schema: z.ZodObject<any>,
    target: 'body' | 'query' | 'params' = 'body',
) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const dataToValidate = req[target];
            const validatedData = schema.parse(dataToValidate);
            req[target] = validatedData;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.errors.map((issue) => ({
                    type: 'ValidationError',
                    msg: `${issue.message}`,
                    path: issue.path.join('.'),
                    location: 'body',
                }));
                const httpError = createHttpError(
                    StatusCodes.BAD_REQUEST,
                    'Validation Error',
                    {
                        errors: errorMessages,
                    },
                );
                (httpError as HttpError).errors = errorMessages;
                next(httpError);
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
