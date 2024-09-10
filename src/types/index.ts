import { Request } from 'express';

export interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
}

export interface RegisterUserRequest extends Request {
    body: UserData;
}

export interface AuthRequest extends Request {
    auth: {
        sub: string;
        role: string;
        id?: string;
    };
}

export interface TenantRequestData {
    name: string;
    address: string;
}

export interface CreateManagerRequest extends Request {
    body: UserData;
}

export interface TenantQueryParams {
    q: string;
    perPage: number;
    currentPage: number;
}
