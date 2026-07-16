import fastifySwagger from "@fastify/swagger";
import ScalarApiReference from "@scalar/fastify-api-reference";
import type { FastifyInstance } from "fastify";

export async function registerDocs(app: FastifyInstance) {
    await app.register(fastifySwagger, {
        openapi: {
            info: {
                title: "GM Sound Manager",
                version: "1.0.0",
            },
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT",
                    },
                },
            },
        },
    });

    await app.register(ScalarApiReference, {
        routePrefix: "/docs",
    });
}