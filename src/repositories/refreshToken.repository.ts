import { AppDataSource } from '../configs/data-source';
import { RefreshToken } from '../entity/RefreshToken';

export const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
