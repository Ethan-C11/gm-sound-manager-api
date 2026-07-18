import {AppDataSource} from "../../../infrastructure/db/AppDataSource.js";
import {Repository} from "typeorm";
import {AudioTrack} from "../../../infrastructure/db/entities/audioTrack.entity.js";
import {SoundType} from "../../../shared/enums/SoundType.js";
import {Zone} from "../../../shared/enums/Zone.js";
import {Ambiance} from "../../../shared/enums/Ambiance.js";
import {AudioTrackResponse} from "../../dtos/soundTrack.schema.js";
import {User} from "../../../infrastructure/db/entities/user.entity.js";
import {Session} from "../../../infrastructure/db/entities/session.entity.js";

class ResolveTracksUseCase {

    private static _instance: ResolveTracksUseCase;

    private _audioTrackRepository: Repository<AudioTrack>;
    private _userRepository: Repository<User>;
    private _sessionRepository: Repository<Session>;

    private constructor() {
        this._audioTrackRepository = AppDataSource.getRepository(AudioTrack);
        this._userRepository = AppDataSource.getRepository(User);
        this._sessionRepository = AppDataSource.getRepository(Session);
    }

    static getInstance(): ResolveTracksUseCase {
        if (!ResolveTracksUseCase._instance) {
            ResolveTracksUseCase._instance = new ResolveTracksUseCase();
        }
        return ResolveTracksUseCase._instance;
    }

    async execute(userId: number, sessionId: number, name: string, type: SoundType, zone: Zone | undefined, ambiance : Ambiance | undefined): Promise<AudioTrackResponse> {
        const user: User | null = await this._userRepository.findOneBy({ id: userId });
        if (!user)
            throw Error("User does not exist");

        const session: Session | null = await this._sessionRepository.findOne({
            where: { id: sessionId },
            relations: { owner: true, sessionMembers: true },
        });

        if (!session)
            throw Error("Session does not exist");

        if (session.owner.id !== user.id)
            throw Error("User is not the owner of the session");

        let soundList : AudioTrack[];

        if(type === SoundType.ZONE && zone !== undefined) {
            soundList = await this._audioTrackRepository.find({ where: { type: type, zone: zone } });
        } else if (type === SoundType.AMBIANCE && ambiance !== undefined) {
            soundList = await this._audioTrackRepository.find({ where: { type: type, ambiance: ambiance } });
        } else
            throw Error("SoundType is invalid and/or zone/ambiance has not been chosen");

        if(soundList.length <= 0)
            throw Error("No such sounds");

        let randint = Math.floor(Math.random() * soundList.length-1);
        let chosenSound = soundList[randint];

        while(chosenSound === undefined)
        {
            randint = Math.floor(Math.random() * soundList.length-1);
            chosenSound = soundList[randint];
        }

        return {
            audioTrack: {
                key: chosenSound.storageKey,
                name: chosenSound.name,
                type: chosenSound.type,
                zone: chosenSound.zone?.toString(),
                ambiance: chosenSound.ambiance?.toString(),
                isUserImported: chosenSound.isUserImported,
            }
        }
    }
}

export default ResolveTracksUseCase
