import createHttpError from 'http-errors';
import { StatusCodes } from 'http-status-codes';
import { Repository } from 'typeorm';
import { Logger } from 'winston';

import { Tenant } from '../entity/Tenant';
import { TenantQueryParams, TenantRequestData } from '../types';

export class TenantService {
    constructor(
        private tenantRepository: Repository<Tenant>,
        private logger: Logger,
    ) {}

    async create({ name, address }: TenantRequestData): Promise<Tenant> {
        this.logger.info('TenantService :: Request to create a tenant');

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

    async update(id: number, tenantData: TenantRequestData) {
        try {
            return await this.tenantRepository.update(id, tenantData);
        } catch (error) {
            this.logger.error(error);
            throw createHttpError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Failed to update tenant.',
            );
        }
    }

    async findById(id: number): Promise<Tenant | null> {
        try {
            return await this.tenantRepository.findOne({
                where: {
                    id,
                },
            });
        } catch (error) {
            this.logger.error(error);
            throw createHttpError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                `Failed to get the tenant with id: ${id}`,
            );
        }
    }

    async findAll(
        validatedQuery: TenantQueryParams,
    ): Promise<[Tenant[], number]> {
        const queryBuilder = this.tenantRepository.createQueryBuilder('tenant');

        if (validatedQuery.q) {
            const searchTerm = `%${validatedQuery.q}%`;
            queryBuilder.where(
                "CONCAT(tenant.name, ' ', tenant.address) ILike :q",
                { q: searchTerm },
            );
        }

        const result = await queryBuilder
            .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
            .take(validatedQuery.perPage)
            .orderBy('tenant.id', 'DESC')
            .getManyAndCount();
        return result;
    }

    async deleteById(tenantId: number) {
        return await this.tenantRepository.delete(tenantId);
    }
}
