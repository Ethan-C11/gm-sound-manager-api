import { Type, Static } from "@fastify/type-provider-typebox";

export const ErrorResponse = Type.Object({
    error: Type.String(),
});