import { StatusCodes } from 'http-status-codes';
import createJWKSMock from 'mock-jwks';
import request from 'supertest';
import { DataSource } from 'typeorm';

import app from '../../src/app';
import { AppDataSource } from '../../src/configs/data-source';
import { Roles } from '../../src/constants';
import { Tenant } from '../../src/entity/Tenant';

describe('POST /api/v1/tenants', () => {
    let connection: DataSource;
    let jwksMock: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        jwksMock = createJWKSMock('http://localhost:5555');
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // Database truncate
        jwksMock.start();
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterEach(async () => {
        jwksMock.stop();
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

            const accessToken = jwksMock.token({
                sub: '1',
                role: Roles.ADMIN,
            });

            const response = await request(app)
                .post('/api/v1/tenants')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send(tenantData);

            expect(response.statusCode).toBe(StatusCodes.CREATED);
        });

        it('should create a tenant in database', async () => {
            const tenantData = {
                name: 'Alex Foods',
                address: 'New York',
            };

            const accessToken = jwksMock.token({
                sub: '1',
                role: Roles.ADMIN,
            });

            await request(app)
                .post('/api/v1/tenants')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send(tenantData);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();
            const tenant = tenants[0];

            expect(tenants).toHaveLength(1);
            expect(tenant).not.toBeNull();
            expect(tenant.name).toBe(tenantData.name);
            expect(tenant.address).toBe(tenantData.address);
        });

        it('should return 401 if user is not authorized', async () => {
            const tenantData = {
                name: 'Alex Foods',
                address: 'New York',
            };

            const response = await request(app)
                .post('/api/v1/tenants')
                .send(tenantData);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();

            expect(tenants).toHaveLength(0);
            expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
        });
    });
});
