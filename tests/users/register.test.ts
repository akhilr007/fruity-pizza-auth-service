import request from 'supertest';
import { DataSource } from 'typeorm';

import app from '../../src/app';
import { AppDataSource } from '../../src/configs/data-source';
import { Roles } from '../../src/constants';
import { User } from '../../src/entity/User';

describe('POST /api/v1/auth/register', () => {
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
        it('should return the 201 status code', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john@example.com',
                password: 'password',
            };

            // Act
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(201);
        });

        it('should return valid json response', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john@example.com',
                password: 'password',
            };

            // Act
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(userData);

            // Assert
            expect(response.headers['content-type']).toEqual(
                expect.stringContaining('json'),
            );
        });

        it('should persist the user in the database', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john@example.com',
                password: 'password',
            };

            // Act
            await request(app).post('/api/v1/auth/register').send(userData);

            // Assert
            const userRepository = await connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0].firstName).toBe(userData.firstName);
            expect(users[0].lastName).toBe(userData.lastName);
            expect(users[0].email).toBe(userData.email);
        });

        it('should return an id of the created user', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john@example.com',
                password: 'password',
            };

            // Act
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(userData);

            // Assert
            const userRepository = await connection.getRepository(User);
            const users = await userRepository.find();

            expect(response.body).toHaveProperty('id');
            expect(typeof response.body.id).toBe('number');
            expect(users[0]).not.toBeNull();
            expect(response.body.id).toBe(users[0].id);
        });

        it('should assign a customer role', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john@example.com',
                password: 'password',
            };

            // Act
            await request(app).post('/api/v1/auth/register').send(userData);

            // Assert
            const userRepository = await connection.getRepository(User);
            const users = await userRepository.find();

            expect(users[0]).toHaveProperty('role');
            expect(users[0].role).toBe(Roles.CUSTOMER);
        });

        it('should have the hashed password in the database', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john@example.com',
                password: 'password',
            };

            // Act
            await request(app).post('/api/v1/auth/register').send(userData);

            // Assert
            const userRepository = await connection.getRepository(User);
            const users = await userRepository.find();

            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toMatch(
                /^\$2[ayb]\$[0-9]{2}\$[./A-Za-z0-9]{53}$/,
            );
        });

        it('should return 400 status code if email already exists', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john@example.com',
                password: 'password',
            };

            const userRepository = await connection.getRepository(User);
            await userRepository.save({ ...userData, role: Roles.CUSTOMER });

            // Act
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(userData);
            const users = await userRepository.find();

            // Assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(1);
        });
    });

    describe('Fields are missing', () => {
        it('should return 400 status code if email, firstName, lastName, password is missing', async () => {
            // Arrange
            const userData = {
                firstName: 'John',
                lastName: '',
                email: '',
                password: 'password',
            };

            // Act
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(userData);

            // Assert
            const userRepository = await connection.getRepository(User);
            const users = await userRepository.find();

            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });
    });

    describe('sanitize fields before saving in the database', () => {
        it('should remove trailing whitespaces from fields', async () => {
            // Arrange
            const userData = {
                firstName: '   John',
                lastName: ' Doe   ',
                email: '  alabama@gmail.com',
                password: 'password',
            };

            // Act
            await request(app).post('/api/v1/auth/register').send(userData);

            // Assert
            const userRepository = await connection.getRepository(User);
            const users = await userRepository.find();
            const user = users[0];

            expect(user.firstName).toMatch('John');
            expect(user.lastName).toMatch('Doe');
            expect(user.email).toMatch('alabama@gmail.com');
        });

        it('should store email in lowercase before saving in the database', async () => {
            // Arrange
            const userData = {
                firstName: '   John',
                lastName: ' Doe   ',
                email: '  JoHn@Doe.com',
                password: 'password',
            };

            // Act
            await request(app).post('/api/v1/auth/register').send(userData);

            // Assert
            const userRepository = await connection.getRepository(User);
            const users = await userRepository.find();
            const user = users[0];

            expect(user.email).toMatch('john@doe.com');
        });
    });
});
