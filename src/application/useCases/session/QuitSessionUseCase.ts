import { Repository} from "typeorm";
import {User} from "../../../infrastructure/db/entities/user.entity.js";
import {Session} from "../../../infrastructure/db/entities/session.entity.js";
import {AppDataSource} from "../../../infrastructure/db/AppDataSource.js";
import {DeleteSessionUseCase} from "./DeleteSessionUseCase.js";

export class QuitSessionUseCase {

    private static _instance: QuitSessionUseCase;

    _userRepository : Repository<User>;
    _sessionRepository : Repository<Session>;
    constructor() {
        this._userRepository = AppDataSource.getRepository(User);
        this._sessionRepository = AppDataSource.getRepository(Session);
    }

    static getInstance(): QuitSessionUseCase {
        if (!QuitSessionUseCase._instance) {
            QuitSessionUseCase._instance = new QuitSessionUseCase();
        }
        return QuitSessionUseCase._instance;
    }

    async execute(sessionId: number, actorId: number, forceDelete : boolean = false): Promise<Session> {

        const actor: User | null = await this._userRepository.findOneBy({ id: actorId });
        if (!actor)
            throw Error("User does not exist");

        const session: Session | null = await this._sessionRepository.findOne({
            where: { id: sessionId },
            relations: { owner: true, sessionMembers: true },
        });
        if (!session)
            throw Error("Session does not exist");

        if(session.owner.id === actor.id) {
            if(forceDelete)
            {
                const deleteSessionUseCase = DeleteSessionUseCase.getInstance();
                return await deleteSessionUseCase.execute(sessionId, actorId);
            }
            else
                throw Error("User cannot quit his own session unless forceDelete is activated");
        } else {
            const sessionMembersCopy = session.sessionMembers ?? [];
            const indexOfMember = sessionMembersCopy.findIndex(m => m.id === actor.id);
            if (indexOfMember === -1)
                throw Error("User is not a member of this session");
            sessionMembersCopy.splice(indexOfMember, 1);
            session.sessionMembers = sessionMembersCopy;
            return await this._sessionRepository.save(session);
        }
    }
}
