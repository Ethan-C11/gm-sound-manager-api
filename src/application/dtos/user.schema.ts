import { Type, Static } from "@fastify/type-provider-typebox";

export const EditUserBody = Type.Object({
    email: Type.Optional(Type.String({ format: "email" })),
    username: Type.Optional(Type.String({ minLength: 3 })),
    password: Type.Optional(Type.String({ minLength: 8 })),
});
export type EditBody = Static<typeof EditUserBody>;

export const UserDeleteParams = Type.Object({
    id: Type.Number(),
});

export const UserResponse = Type.Object({
    user: Type.Object({
        id: Type.Number(),
        email: Type.String(),
        username: Type.String(),
    }),
});
