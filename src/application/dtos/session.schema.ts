import { Type, Static } from "@fastify/type-provider-typebox";

export const CreateSessionBody = Type.Object({
    sessionName: Type.String({ minLength: 1 }),
});
export type CreateSessionBody = Static<typeof CreateSessionBody>;

export const JoinSessionBody = Type.Object({
    inviteCode: Type.String({ minLength: 6, maxLength: 6 }),
});
export type JoinSessionBody = Static<typeof JoinSessionBody>;

export const QuitSessionBody = Type.Object({
    forceDelete: Type.Optional(Type.Boolean()),
});
export type QuitSessionBody = Static<typeof QuitSessionBody>;

export const SessionParams = Type.Object({
    id: Type.Number(),
});
export type SessionParams = Static<typeof SessionParams>;

const UserSummary = Type.Object({
    id: Type.Number(),
    username: Type.String(),
});

export const SessionResponse = Type.Object({
    id: Type.Number(),
    sessionName: Type.String(),
    inviteCode: Type.String(),
    createdAt: Type.String(),
    owner: UserSummary,
    sessionMembers: Type.Array(UserSummary),
});
