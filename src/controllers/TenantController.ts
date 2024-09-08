import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Logger } from 'winston';

import { TenantService } from '../services/TenantService';

export class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger,
    ) {}

    async create(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        this.logger.info('TenantController :: New Request to create a tenant');
        try {
            const { name, address } = req.body;

            const tenant = await this.tenantService.create({ name, address });

            this.logger.info(
                'TenantController :: Successfully created a new tenant',
            );
            res.status(StatusCodes.CREATED).json({
                id: tenant.id,
            });
        } catch (error) {
            this.logger.error(error);
            next(error);
        }
    }
}
