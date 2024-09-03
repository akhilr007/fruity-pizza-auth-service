import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { StatusCodes } from 'http-status-codes';
import { Repository } from 'typeorm';
import { Logger } from 'winston';

import { Config } from '../configs';
import { Roles } from '../constants';
import { User } from '../entity/User';
import { UserData } from '../types';

export class UserService {
    constructor(
        private userRepository: Repository<User>,
        private logger: Logger,
    ) {}

    async create({
        firstName,
        lastName,
        email,
        password,
    }: UserData): Promise<User> {
        // check for unique user
        const user = await this.findByEmail(email);

        if (user) {
            throw createHttpError(
                StatusCodes.CONFLICT,
                'User already exists with same email.',
            );
        }

        // hash the password
        const saltRounds = Number(Config.SALT_ROUNDS) || 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        try {
            this.logger.info('User Service :: started registering the user');
            const user = await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });
            this.logger.info(
                `User Service :: Successfully registered user with id:  ${user.id}`,
            );
            return user;
        } catch (error) {
            this.logger.error('User Service :: Failed to register user', {
                error,
            });
            throw createHttpError(500, 'Failed to register user in database');
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findOne({
            where: {
                email: email,
            },
        });
    }
}
