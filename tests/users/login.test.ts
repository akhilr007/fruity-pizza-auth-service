import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { DataSource } from 'typeorm';

import app from '../../src/app';
import { AppDataSource } from '../../src/configs/data-source';
import { isJwt } from '../utils';

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
                role: 'customer',
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
                role: 'customer',
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
                role: 'customer',
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
                role: 'customer',
            };

            const userLoginData = {
                email: 'john@example.com',
                password: 'passwordsfd',
            };

            // Act
            await request(app).post('/api/v1/auth/register').send(userData);
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send(userLoginData);

            // Assert
            expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
        });

        it('should return access token and refresh token inside a cookie', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john@example.com',
                password: 'password',
                role: 'customer',
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
            interface Headers {
                ['set-cookie']: string[];
            }

            const cookies =
                (response.headers as unknown as Headers)['set-cookie'] || [];

            let accessToken: string | null = null;
            let refreshToken: string | null = null;

            cookies.forEach((cookie) => {
                if (cookie.startsWith('accessToken=')) {
                    accessToken = cookie.split(';')[0].split('=')[1];
                } else if (cookie.startsWith('refreshToken=')) {
                    refreshToken = cookie.split(';')[0].split('=')[1];
                }
            });

            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();

            expect(isJwt(accessToken)).toBeTruthy();
            expect(isJwt(refreshToken)).toBeTruthy();
        });
    });

    // todo
    describe('Fields are empty', () => {
        it('should return 400 status code if email, password is missing', async () => {
            // Arrange
            const userLoginData = {
                email: '',
                password: 'password',
            };

            // Act
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send(userLoginData);

            // Assert
            expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
        });
    });
});
