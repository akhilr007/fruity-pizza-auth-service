import { AppDataSource } from '../configs/data-source';
import { Tenant } from '../entity/Tenant';

export const tenantRepository = AppDataSource.getRepository(Tenant);
