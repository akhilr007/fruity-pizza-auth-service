import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { StatusCodes } from 'http-status-codes';
import { Brackets, Repository } from 'typeorm';
import { Logger } from 'winston';

import { Config } from '../configs';
import { User } from '../entity/User';
import { LimitedUserData, UserData, UserQueryParams } from '../types';

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
        role,
        tenantId,
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
                role,
                tenant: tenantId ? { id: tenantId } : undefined,
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
            relations: {
                tenant: true,
            },
        });
    }

    async findById(id: number): Promise<User | null> {
        return await this.userRepository.findOne({
            where: {
                id: id,
            },
            relations: {
                tenant: true,
            },
        });
    }

    async findAll(validatedQuery: UserQueryParams) {
        const queryBuilder = this.userRepository.createQueryBuilder('user');

        if (validatedQuery.q) {
            const searchTerm = `%${validatedQuery.q}%`;
            queryBuilder.where(
                new Brackets((qb) => {
                    qb.where(
                        "CONCAT(user.firstName, ' ', user.lastName) ILike :q",
                        { q: searchTerm },
                    ).orWhere('user.email ILike :q', { q: searchTerm });
                }),
            );
        }

        if (validatedQuery.role) {
            queryBuilder.andWhere('user.role = :role', {
                role: validatedQuery.role,
            });
        }

        const result = await queryBuilder
            .leftJoinAndSelect('user.tenant', 'tenant')
            .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
            .take(validatedQuery.perPage)
            .orderBy('user.id', 'DESC')
            .getManyAndCount();

        return result;
    }

    async deleteById(id: number) {
        return await this.userRepository.delete(id);
    }

    async update(
        userId: number,
        { firstName, lastName, role, email, tenantId }: LimitedUserData,
    ) {
        return await this.userRepository.update(userId, {
            firstName,
            lastName,
            role,
            email,
            tenant: tenantId ? { id: tenantId } : null,
        });
    }
}
