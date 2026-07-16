import { Session } from "../../infrastructure/db/entities/session.entity.js";

export function toSessionDto(session: Session) {
    return {
        id: session.id,
        sessionName: session.sessionName,
        inviteCode: session.inviteCode,
        createdAt: session.createdAt.toISOString(),
        owner: { id: session.owner.id, username: session.owner.username },
        sessionMembers: (session.sessionMembers ?? []).map(m => ({ id: m.id, username: m.username })),
    };
}