import {DeleteResult, Repository} from "typeorm";
import {User} from "../../infrastructure/db/entities/user.entity.js";
import {Session} from "../../infrastructure/db/entities/session.entity.js";
import {AppDataSource} from "../../infrastructure/db/AppDataSource.js";

export class DeleteSessionUseCase {

  _userRepository : Repository<User>;
  _sessionRepository : Repository<Session>;

  constructor() {
    this._userRepository = AppDataSource.getRepository(User);
    this._sessionRepository = AppDataSource.getRepository(Session);
  }

  async execute(sessionId: number, actorId: number, systemBypass : boolean = false): Promise<DeleteResult> {

    const actor: User | null = await this._userRepository.findOneBy({ id: actorId });
    if (!actor)
      throw Error("User does not exist");

    const session: Session | null = await this._sessionRepository.findOneBy({ id: sessionId });
    if (!session)
      throw Error("Session does not exist");

    if(!systemBypass) {
      if(session.owner != actor)
        throw Error("User is not the owner of the session");

      return await this._sessionRepository.remove(session);
    } else
      return await this._sessionRepository.remove(session);

  }
}
