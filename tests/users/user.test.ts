import { StatusCodes } from 'http-status-codes';
import createJWKSMock from 'mock-jwks';
import request from 'supertest';
import { DataSource } from 'typeorm';

import app from '../../src/app';
import { AppDataSource } from '../../src/configs/data-source';
import { Roles } from '../../src/constants';
import { User } from '../../src/entity/User';

describe('GET /api/v1/auth/whoami', () => {
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
        it('should return 200 status code', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@email.com',
                password: 'password',
            };
            const userRepository = connection.getRepository(User);
            const user = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });

            // generate token
            const accessToken = jwksMock.token({
                sub: '1',
                role: user.role,
            });
            const response = await request(app)
                .get('/api/v1/auth/whoami')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send();
            expect(response.statusCode).toBe(StatusCodes.OK);
        });

        it('should return user data', async () => {
            // register user
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@email.com',
                password: 'password',
            };
            const userRepository = connection.getRepository(User);
            const user = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });

            // generate token
            const accessToken = jwksMock.token({
                sub: String(user.id),
                role: user.role,
            });
            // add token to cookies
            const response = await request(app)
                .get('/api/v1/auth/whoami')
                .set('Cookie', [`accessToken=${accessToken};`])
                .send();

            // Assert
            // check if user id matches with registered user
            expect(response.body.id).toBe(user.id);
        });
    });
});
