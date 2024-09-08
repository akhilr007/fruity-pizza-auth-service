import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { DataSource } from 'typeorm';

import app from '../../src/app';
import { AppDataSource } from '../../src/configs/data-source';

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
                address: 'password',
            };

            const response = await request(app)
                .post('/api/v1/tenants')
                .send(tenantData);

            expect(response.statusCode).toBe(StatusCodes.CREATED);
        });
    });
});
