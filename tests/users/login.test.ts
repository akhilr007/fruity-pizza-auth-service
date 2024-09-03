// import { StatusCodes } from 'http-status-codes';
// import request from 'supertest';
import { DataSource } from 'typeorm';

// import app from '../../src/app';
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
        it.todo('should return 200 status code when login is successful');
    });

    // todo
    // describe('Fields are empty', () => {});
});
