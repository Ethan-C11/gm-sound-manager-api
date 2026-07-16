import { Role } from "../enums/Role.js";

export interface JwtPayload {
    id: number;
    email: string;
    role: Role;
}