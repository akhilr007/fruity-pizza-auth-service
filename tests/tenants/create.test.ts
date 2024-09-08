import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { DataSource } from 'typeorm';

import app from '../../src/app';
import { AppDataSource } from '../../src/configs/data-source';
import { Tenant } from '../../src/entity/Tenant';

describe('POST /api/v1/tenants', () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // Database truncate
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe('Given all fields', () => {
        it('should return 201 status codes', async () => {
            const tenantData = {
                name: 'Alex Foods',
                address: 'New York',
            };

            const response = await request(app)
                .post('/api/v1/tenants')
                .send(tenantData);

            expect(response.statusCode).toBe(StatusCodes.CREATED);
        });

        it('should create a tenant in database', async () => {
            const tenantData = {
                name: 'Alex Foods',
                address: 'New York',
            };

            await request(app).post('/api/v1/tenants').send(tenantData);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();
            const tenant = tenants[0];

            expect(tenants).toHaveLength(1);
            expect(tenant).not.toBeNull();
            expect(tenant.name).toBe(tenantData.name);
            expect(tenant.address).toBe(tenantData.address);
        });
    });
});
