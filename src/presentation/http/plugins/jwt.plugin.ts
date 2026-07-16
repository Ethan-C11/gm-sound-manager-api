import fastifyJwt from "@fastify/jwt";
import type { FastifyInstance } from "fastify";

export async function registerJwt(app: FastifyInstance) {
    await app.register(fastifyJwt, {
        secret: process.env.JWT_SECRET!,
        sign: {
            expiresIn: "4h", // long time because there is no sensible data and TTRPG session can be long
        },
    });
}