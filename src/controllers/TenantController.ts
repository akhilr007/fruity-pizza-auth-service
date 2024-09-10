import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
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

    async update(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;

        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, 'Invalid url param.'));
            return;
        }

        const { name, address } = req.body;

        this.logger.debug(
            'TenantController :: Request for updating a tenant',
            req.body,
        );

        try {
            await this.tenantService.update(Number(tenantId), {
                name,
                address,
            });

            this.logger.info('TenantController :: Tenant has been updated', {
                id: tenantId,
            });

            res.status(StatusCodes.OK).json({ id: Number(tenantId) });
        } catch (error) {
            this.logger.error(error);
            next(error);
        }
    }

    async findById(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        const tenantId = req.params.id;
        this.logger.info(
            'TenantController :: Request for getting a tenant with id ' +
                tenantId,
        );
        if (isNaN(Number(tenantId))) {
            this.logger.error(
                'TenantController :: Invalid tenant id:' + tenantId,
            );
            next(createHttpError(400, 'Invalid url param.'));
            return;
        }

        try {
            const response = await this.tenantService.findById(
                Number(tenantId),
            );

            this.logger.info(
                'TenantController :: Successfully find the tenant with id ' +
                    tenantId,
            );
            res.status(StatusCodes.OK).json(response);
        } catch (error) {
            this.logger.error(error);
            next(error);
        }
    }

    async findAll(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        this.logger.info('TenantController :: Request to get all tenants list');
        try {
            const response = await this.tenantService.findAll();

            this.logger.info(
                'TenantController :: Successfully fetched all tenants',
            );

            res.status(StatusCodes.OK).json(response);
        } catch (error) {
            this.logger.error(error);
            next(error);
        }
    }
}
