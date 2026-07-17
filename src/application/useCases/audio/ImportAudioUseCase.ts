import {AppDataSource} from "../../../infrastructure/db/AppDataSource.js";
import {Repository} from "typeorm";
import {AudioTrack} from "../../../infrastructure/db/entities/audioTrack.entity.js";
import {SoundType} from "../../../shared/enums/SoundType.js";
import {Zone} from "../../../shared/enums/Zone.js";
import {Ambiance} from "../../../shared/enums/Ambiance.js";
import {MinioStorageService} from "../../../infrastructure/storage/MinioStorageService.js";
import {MultipartFile} from "@fastify/multipart";
import {SoundTrackResponse} from "../../dtos/soundTrack.schema.js";

class ImportAudioUseCase {

    private static _instance: ImportAudioUseCase;

    private _audioTrackRepository: Repository<AudioTrack>;

    private constructor() {
        this._audioTrackRepository = AppDataSource.getRepository(AudioTrack);
    }

    static getInstance(): ImportAudioUseCase {
        if (!ImportAudioUseCase._instance) {
            ImportAudioUseCase._instance = new ImportAudioUseCase();
        }
        return ImportAudioUseCase._instance;
    }

    async execute(file : MultipartFile | undefined, name: string, type: SoundType, zone: Zone | undefined, ambiance : Ambiance | undefined, isUserImported : boolean): Promise<SoundTrackResponse> {
        if (!file)
            throw Error("No file selected" );

        if(!ambiance && !zone)
            throw Error("You need to select at least one zone or ambiance" );

        let userId = 0;
        const key = `sounds/${type}/${userId}/${file.filename}`;

        const buffer = await file.toBuffer();

        await MinioStorageService.getInstance().upload(key, buffer, buffer.length, file.mimetype);

         const res : SoundTrackResponse = {
             soundTrack: {
                 key: key,
                 name: name,
                 type: type,
                 zone: zone,
                 ambiance: zone,
                 isUserImported: isUserImported,
             }
        }

        return res;
    }
}

export default ImportAudioUseCase
