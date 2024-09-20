import { StatusCodes } from 'http-status-codes';
import createJWKSMock from 'mock-jwks';
import request from 'supertest';
import { DataSource } from 'typeorm';

import app from '../../src/app';
import { AppDataSource } from '../../src/configs/data-source';
import { Roles } from '../../src/constants';
import { User } from '../../src/entity/User';

describe('POST /api/v1/users', () => {
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
        it('should persist the user in the database', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@email.com',
                password: 'password',
                role: Roles.MANAGER,
                tenant: 1,
            };

            // generate token
            const accessToken = jwksMock.token({
                sub: '1',
                role: Roles.ADMIN,
            });

            const response = await request(app)
                .post('/api/v1/users')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(response.statusCode).toBe(StatusCodes.CREATED);
            expect(users).toHaveLength(1);
            expect(users[0].email).toBe(userData.email);
        });

        it('should create a manager user', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@email.com',
                password: 'password',
                role: Roles.MANAGER,
                tenant: 1,
            };

            // generate token
            const accessToken = jwksMock.token({
                sub: '1',
                role: Roles.ADMIN,
            });

            await request(app)
                .post('/api/v1/users')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(1);
            expect(users[0].role).toBe(Roles.MANAGER);
        });

        it.todo('should return 403 if non admin user tries to create a user');
    });
});
