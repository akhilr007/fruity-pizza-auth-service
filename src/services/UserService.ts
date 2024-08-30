import { Repository } from 'typeorm';

import { User } from '../entity/User';
import { UserData } from '../types';

export class UserService {
    constructor(private userRepository: Repository<User>) {
        this.userRepository = userRepository;
    }

    async create({ firstName, lastName, email, password }: UserData) {
        return await this.userRepository.save({
            firstName,
            lastName,
            email,
            password,
        });
    }
}
