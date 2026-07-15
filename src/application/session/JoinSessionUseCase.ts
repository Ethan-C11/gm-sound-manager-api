import type { Session } from "../../infrastructure/db/entities/session.entity.js";

export class JoinSessionUseCase {
  async execute(inviteCode: string, userId: number): Promise<Session> {
    throw new Error("Not implemented");
  }
}
