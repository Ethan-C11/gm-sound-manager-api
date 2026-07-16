import { Session } from "../../infrastructure/db/entities/session.entity.js";
import {User} from "../../infrastructure/db/entities/user.entity.js";
import {AppDataSource} from "../../infrastructure/db/AppDataSource.js";
import {Repository} from "typeorm";
import {generateRandomString} from "../../shared/utils/GenerateRandomString.js";

export class CreateSessionUseCase {

  _userRepository : Repository<User>;
  _sessionRepository : Repository<Session>;

  constructor() {
    this._userRepository = AppDataSource.getRepository(User);
    this._sessionRepository = AppDataSource.getRepository(Session);
  }

  async execute(ownerId: number, sessionName: string): Promise<Session> {
    const owner: User | null = await this._userRepository.findOneBy({ id: ownerId });

    if (!owner)
      throw Error("User does not exist");

    const ownerAlreadyHasASession : boolean = await this._sessionRepository.exists({
      where: { owner: owner }
    })

    if(ownerAlreadyHasASession)
      throw Error("Owner already has a open session");

    let inviteCode : string = generateRandomString(6);
    let isInviteCodeAlreadyUsed: Session | null = await this._sessionRepository.findOneBy({ inviteCode: inviteCode });

    while(!isInviteCodeAlreadyUsed) //just in case i'm unlucky enough to have an already used code
    {
      inviteCode = generateRandomString(6);
      isInviteCodeAlreadyUsed = await this._sessionRepository.findOneBy({ inviteCode: inviteCode });
    }

    const session = this._sessionRepository.create({
      owner: owner,
      sessionName: sessionName,
      inviteCode : inviteCode,
      sessionMembers : [owner] //owner is a member of their own session to allow me to only iterate on the members and not the owner too
    })

    return await this._sessionRepository.save(session);
  }
}
