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

        it('should return valid json response', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john@example.com',
                password: 'password',
            };

            const userLoginData = {
                email: 'john@example.com',
                password: 'password',
            };

            // Act
            await request(app).post('/api/v1/auth/register').send(userData);
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send(userLoginData);

            // Assert
            expect(response.headers['content-type']).toEqual(
                expect.stringContaining('json'),
            );
        });

        it('should return id of the logged in user', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john@example.com',
                password: 'password',
            };

            const userLoginData = {
                email: 'john@example.com',
                password: 'password',
            };

            // Act
            const user = await request(app)
                .post('/api/v1/auth/register')
                .send(userData);
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send(userLoginData);

            // Assert
            expect(response.body).toHaveProperty('id');
            expect(typeof response.body.id).toBe('number');
            expect(response).not.toBeNull();
            expect(response.body.id).toBe(user.body.id);
        });

        it('should return 401 status code if email is wrong', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john@example.com',
                password: 'password',
            };

            const userLoginData = {
                email: 'john.doe@example.com',
                password: 'password',
            };

            // Act
            await request(app).post('/api/v1/auth/register').send(userData);
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send(userLoginData);

            // Assert
            expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
        });

        it('should return 401 status code if password is wrong', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john@example.com',
                password: 'password',
            };

            const userLoginData = {
                email: 'john@example.com',
                password: 'passwordsdf',
            };

            // Act
            await request(app).post('/api/v1/auth/register').send(userData);
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send(userLoginData);

            // Assert
            expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
        });
    });

    // todo
    // describe('Fields are empty', () => {});
});
