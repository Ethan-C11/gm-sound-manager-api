import type { FastifyInstance } from "fastify";
import {MultipartFile} from "@fastify/multipart";
import {AuthResponse} from "../../../application/dtos/auth.schema.js";
import {ErrorResponse} from "../../../application/dtos/shared.schema.js";
import {SoundType} from "../../../shared/enums/SoundType.js";
import {Zone} from "../../../shared/enums/Zone.js";
import {Ambiance} from "../../../shared/enums/Ambiance.js";
import ImportAudioUseCase from "../../../application/useCases/audio/ImportAudioUseCase.js";
import {AudioTrackBody, AudioTrackResponse} from "../../../application/dtos/soundTrack.schema.js";
import {authenticate} from "../hooks/authenticate.js";
import {authorize} from "../hooks/authorize.js";
import {Role} from "../../../shared/enums/Role.js";

export async function audioRoutes(app: FastifyInstance) {

    app.post("/upload", {
        preHandler: [authenticate, authorize(Role.USER, Role.ADMIN)],
        schema: {
            tags: ["Soundtrack"],
            summary: "Upload a sound for every user",
            body: AudioTrackBody,
            response: {
                200: AudioTrackResponse,
                400: ErrorResponse,
            },
        },
    }, async (request, reply) => {
        const body = request.body as any;

        const name = body.name?.value;
        const type = body.type?.value as SoundType;
        const zone = (body.zone?.value || undefined) as Zone | undefined;
        const ambiance = (body.ambiance?.value || undefined) as Ambiance | undefined;
        const isUserImported = body.isUserImported?.value === "true";
        const file = body.file;

        try {
            const soundTrack = await ImportAudioUseCase.getInstance().execute(request.user.id, file, name, type, zone, ambiance, isUserImported);

            return reply.status(200).send(soundTrack);
        } catch (err) {
            return reply.status(400).send({ error: (err as Error).message });
        }
    });
}