import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { DataSource } from 'typeorm';

import app from '../../src/app';
import { AppDataSource } from '../../src/configs/data-source';

describe('POST /api/v1/auth/login', () => {
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
        it('should return 200 status code when login is successful', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@email.com',
                password: 'password',
            };

            const userLoginData = {
                email: 'john.doe@email.com',
                password: 'password',
            };

            // Act
            await request(app).post('/api/v1/auth/register').send(userData);

            const response = await request(app)
                .post('/api/v1/auth/login')
                .send(userLoginData);

            // Assert
            expect(response.statusCode).toBe(StatusCodes.OK);
        });
    });

    // todo
    // describe('Fields are empty', () => {});
});
