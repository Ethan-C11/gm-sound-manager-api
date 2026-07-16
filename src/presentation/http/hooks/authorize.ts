import type { FastifyRequest, FastifyReply } from "fastify";
import { Role } from "../../../shared/enums/Role.js";

export function authorize(...allowedRoles: Role[]) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        if (!allowedRoles.includes(request.user.role)) {
            return reply.status(403).send({ error: "Forbidden" });
        }
    };
}