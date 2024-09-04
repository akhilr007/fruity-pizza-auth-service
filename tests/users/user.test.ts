import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { DataSource } from 'typeorm';

import app from '../../src/app';
import { AppDataSource } from '../../src/configs/data-source';

describe('GET /api/v1/auth/whoami', () => {
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
        it('should return 200 status code', async () => {
            const response = await request(app)
                .get('/api/v1/auth/whoami')
                .send();

            expect(response.statusCode).toBe(StatusCodes.OK);
        });
    });
});
