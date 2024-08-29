import { Repository } from 'typeorm';

import { AppDataSource } from '../configs/data-source';
import { User } from '../entity/User';
import { UserData } from '../types';

export class UserService {
    constructor(private userRepository: Repository<User>) {
        this.userRepository = userRepository;
    }

    async create({ firstName, lastName, email, password }: UserData) {
        const userRepository = AppDataSource.getRepository(User);
        await userRepository.save({ firstName, lastName, email, password });
    }
}
