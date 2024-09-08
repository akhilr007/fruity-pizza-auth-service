import createHttpError from 'http-errors';
import { StatusCodes } from 'http-status-codes';
import { Repository } from 'typeorm';
import { Logger } from 'winston';

import logger from '../configs/logger';
import { Tenant } from '../entity/Tenant';
import { TenantRequestData } from '../types';

export class TenantService {
    constructor(
        private tenantRepository: Repository<Tenant>,
        private logger: Logger,
    ) {}

    async create({ name, address }: TenantRequestData): Promise<Tenant> {
        logger.info('TenantService :: Request to create a tenant');

        try {
            this.logger.info('TenantService :: Successfully created a tenant');
            return await this.tenantRepository.save({ name, address });
        } catch (error) {
            this.logger.error(error);
            throw createHttpError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Failed to create tenant.',
            );
        }
    }
}
