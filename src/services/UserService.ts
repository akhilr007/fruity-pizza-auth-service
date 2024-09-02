import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
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
        const user = await this.userRepository.findOne({
            where: { email: email },
        });

        if (user) {
            throw createHttpError(400, 'User already exists');
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
}
