import "@fastify/jwt";
import { JwtPayload } from "./jwt-payload.js";

declare module "@fastify/jwt" {
    interface FastifyJWT {
        payload: JwtPayload;
        user: JwtPayload;
    }
}