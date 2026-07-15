import type { Session } from "../../infrastructure/db/entities/session.entity.js";

export class CreateSessionUseCase {
  async execute(ownerId: number, event: string, codeOfEvent: string): Promise<Session> {
    throw new Error("Not implemented");
  }
}
