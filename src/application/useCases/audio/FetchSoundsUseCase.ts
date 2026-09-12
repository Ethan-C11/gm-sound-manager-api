import {AppDataSource} from "../../../infrastructure/db/AppDataSource.js";
import {Repository} from "typeorm";
import {AudioTrack} from "../../../infrastructure/db/entities/audioTrack.entity.js";
import {SoundType} from "../../../shared/enums/SoundType.js";
import {Zone} from "../../../shared/enums/Zone.js";
import {AudioTrackResponse} from "../../dtos/soundTrack.schema.js";
import {User} from "../../../infrastructure/db/entities/user.entity.js";
import {Ambiance} from "../../../shared/enums/Ambiance.js";
import { IsNull } from 'typeorm';

class FetchSoundsUseCase {
    private static _instance: FetchSoundsUseCase;

    private _audioTrackRepository: Repository<AudioTrack>;
    private _userRepository: Repository<User>;

    private constructor() {
        this._audioTrackRepository = AppDataSource.getRepository(AudioTrack);
        this._userRepository = AppDataSource.getRepository(User);
    }

    static getInstance(): FetchSoundsUseCase {
        if (!FetchSoundsUseCase._instance) {
            FetchSoundsUseCase._instance = new FetchSoundsUseCase();
        }
        return FetchSoundsUseCase._instance;
    }

    async execute(userId: number = 0, type: SoundType,zone: Zone | undefined, ambiance: Ambiance | undefined, isUserImported: boolean | undefined, offset: number = 0, limit: number = 20): Promise<{ data: AudioTrackResponse[], total: number }> {
        if (type !== SoundType.ZONE && type !== SoundType.AMBIANCE) {
            throw Error("SoundType is invalid and/or zone/ambiance has not been chosen");
        }

        const user: User | null = await this._userRepository.findOneBy({ id: userId });
        if (!user)
            throw Error("User does not exist");

        const baseCondition: any = {
            type: type
        };

        if (isUserImported !== undefined) {
            baseCondition.isUserImported = isUserImported;
        }

        if (type === SoundType.ZONE && zone != null) {
            baseCondition.zone = zone;
        } else if (type === SoundType.AMBIANCE && ambiance != null) {
            baseCondition.ambianceMusic = ambiance;
        }

        const finalWhereCondition = [
            { ...baseCondition, uploadedBy: userId },
            { ...baseCondition, uploadedBy: IsNull() }
        ];

        const [soundList, totalCount] = await this._audioTrackRepository.findAndCount({
            where: finalWhereCondition,
            skip: offset,
            take: limit
        });

        if(soundList.length <= 0)
            throw Error("No such sounds");

        const responseList: AudioTrackResponse[] = soundList.map(chosenSound => {
            return {
                key: chosenSound.storageKey,
                name: chosenSound.name,
                type: chosenSound.type,
                zone: chosenSound.zone?.toString(),
                ambiance: chosenSound.ambianceMusic?.toString(),
                isUserImported: chosenSound.isUserImported,
            } as AudioTrackResponse;
        });

        return {
            data: responseList,
            total: totalCount
        };

    }
}

export default FetchSoundsUseCase
