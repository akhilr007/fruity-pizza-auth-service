import request from 'supertest';

import app from '../../src/app';

describe('POST /api/v1/auth/register', () => {
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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(userData);

            // Assert
        });
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    describe('Fields are given', () => {});
});
