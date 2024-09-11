import { Request } from 'express';

export interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    tenantId?: number;
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

export interface UserResponse {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
}

export interface LimitedUserData {
    firstName: string;
    lastName: string;
    role: string;
    email: string;
    tenantId: number;
}
export interface UpdateUserRequest extends Request {
    body: LimitedUserData;
}

export interface UserQueryParams {
    perPage: number;
    currentPage: number;
    q: string;
    role: string;
}
