    import type { FastifyInstance } from "fastify";
import { JwtPayload } from "../../../shared/types/jwt-payload.js";
import {SignUpUseCase} from "../../../application/auth/SignUpUseCase.js";
import {SignInUseCase} from "../../../application/auth/SignInUseCase.js";
    import {AuthResponse, ErrorResponse, SignInBody, SignUpBody} from "../../../application/dtos/auth.schema.js";

export async function authRoutes(app: FastifyInstance) {

    app.post("/signup", {
        schema: {
            tags: ["Auth"],
            summary: "Create an user account",
            body: SignUpBody,
            response: {
                201: AuthResponse,
                400: ErrorResponse,
            },
        },
    }, async (request, reply) => {
        const { email, username, password } = request.body as {
            email: string; username: string; password: string;
        };

        try {
            const user = await SignUpUseCase.getInstance().execute(email, username, password);

            const payload: JwtPayload = { id: user.id, email: user.email, role: user.role };
            const token = app.jwt.sign(payload);

            return reply.status(201).send({ token, user: { id: user.id, email: user.email, username: user.username } });
        } catch (err) {
            return reply.status(400).send({ error: (err as Error).message });
        }
    });

    app.post("/signin", {
        schema: {
            tags: ["Auth"],
            summary: "Connect to an user account",
            body: SignInBody,
            response: {
                200: AuthResponse,
                401: ErrorResponse,
            },
        },
    }, async (request, reply) => {
        const { email, password } = request.body as { email: string; password: string };

        try {
            const user = await SignInUseCase.getInstance().execute(email, password);

            const payload: JwtPayload = { id: user.id, email: user.email, role: user.role };
            const token = app.jwt.sign(payload);

            return reply.status(200).send({ token, user: { id: user.id, email: user.email, username: user.username } });
        } catch (err) {
            return reply.status(401).send({ error: (err as Error).message });
        }
    });
}