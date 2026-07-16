import { Session } from "../../../infrastructure/db/entities/session.entity.js";
import {Repository} from "typeorm";
import {User} from "../../../infrastructure/db/entities/user.entity.js";
import {AppDataSource} from "../../../infrastructure/db/AppDataSource.js";

export class JoinSessionUseCase {

  private static _instance: JoinSessionUseCase;

  _userRepository : Repository<User>;
  _sessionRepository : Repository<Session>;

  constructor() {
    this._userRepository = AppDataSource.getRepository(User);
    this._sessionRepository = AppDataSource.getRepository(Session);
  }

  static getInstance(): JoinSessionUseCase {
    if (!JoinSessionUseCase._instance) {
      JoinSessionUseCase._instance = new JoinSessionUseCase();
    }
    return JoinSessionUseCase._instance;
  }

  async execute(inviteCode: string, userId: number): Promise<Session> {
    let existingSession : Session | null = await this._sessionRepository.findOne({
      where: { inviteCode },
      relations: { sessionMembers: true },
    });

    if (!existingSession)
      throw Error("Could not find a session with the Invite Code " + inviteCode);

    const user: User | null = await this._userRepository.findOneBy({ id: userId });
    if (!user)
      throw Error("User not found");

    const newMemberList = existingSession.sessionMembers ?? [];
    newMemberList.push(user);

    existingSession.sessionMembers = newMemberList;
    return await this._sessionRepository.save(existingSession);
  }
}
