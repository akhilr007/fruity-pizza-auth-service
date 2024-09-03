import bcrypt from 'bcrypt';

export class CredentialService {
    async comparePassword(
        userPassword: string,
        passwordHash: string,
    ): Promise<boolean> {
        return bcrypt.compare(userPassword, passwordHash);
    }
}
