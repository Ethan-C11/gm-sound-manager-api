import {AppDataSource} from "../../../infrastructure/db/AppDataSource.js";
import {Repository} from "typeorm";
import {AudioTrack} from "../../../infrastructure/db/entities/audioTrack.entity.js";
import {SoundType} from "../../../shared/enums/SoundType.js";
import {Zone} from "../../../shared/enums/Zone.js";
import {Ambiance} from "../../../shared/enums/Ambiance.js";
import {MinioStorageService} from "../../../infrastructure/storage/MinioStorageService.js";
import {MultipartFile} from "@fastify/multipart";
import {AudioTrackResponse} from "../../dtos/soundTrack.schema.js";
import {User} from "../../../infrastructure/db/entities/user.entity.js";

class ImportAudioUseCase {

    private static _instance: ImportAudioUseCase;

    private _audioTrackRepository: Repository<AudioTrack>;
    private _userRepository: Repository<User>;

    private constructor() {
        this._audioTrackRepository = AppDataSource.getRepository(AudioTrack);
        this._userRepository = AppDataSource.getRepository(User);
    }

    static getInstance(): ImportAudioUseCase {
        if (!ImportAudioUseCase._instance) {
            ImportAudioUseCase._instance = new ImportAudioUseCase();
        }
        return ImportAudioUseCase._instance;
    }

    async execute(userId: number = 0, file : MultipartFile | undefined, name: string, type: SoundType, zone: Zone | undefined, ambiance : Ambiance | undefined, isUserImported : boolean): Promise<AudioTrackResponse> {
        if (!file)
            throw Error("No file selected" );

        if(!file.filename.endsWith("mp3") || !file.filename.endsWith("wav"))
            throw Error("Only .mp3 and .wav are allowed" );

        if(!ambiance && !zone)
            throw Error("You need to select at least one zone or ambiance" );

        if(!isUserImported)
            userId = 0

        const key = `sounds/${type}/${userId}/${file.filename}`;
        const buffer = await file.toBuffer();

        await MinioStorageService.getInstance().upload(key, buffer, buffer.length, file.mimetype);

        let uploader: User | null = null;
        if (isUserImported && userId) {
            uploader = await this._userRepository.findOneBy({ id: userId });
            if (!uploader)
                throw Error("User does not exist");
        }

        const audioTrack = this._audioTrackRepository.create({
            name: name,
            storageKey: key,
            mimeType: file.mimetype,
            sizeInBytes: buffer.length,
            type: type,
            zone: zone ?? null,
            ambiance: ambiance ?? null,
            uploadedBy: uploader,
            isUserImported: isUserImported,
        });

        await this._audioTrackRepository.save(audioTrack);

         return {
             audioTrack: {
                 key: key,
                 name: name,
                 type: type,
                 zone: zone,
                 ambiance: ambiance,
                 isUserImported: isUserImported,
             }
        }

    }
}

export default ImportAudioUseCase
