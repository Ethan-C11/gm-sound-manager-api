import type { FastifyInstance } from "fastify";
import {MultipartFile} from "@fastify/multipart";
import {AuthResponse} from "../../../application/dtos/auth.schema.js";
import {ErrorResponse} from "../../../application/dtos/shared.schema.js";
import {SoundType} from "../../../shared/enums/SoundType.js";
import {Zone} from "../../../shared/enums/Zone.js";
import {Ambiance} from "../../../shared/enums/Ambiance.js";
import ImportAudioUseCase from "../../../application/useCases/audio/ImportAudioUseCase.js";
import {SoundTrackBody} from "../../../application/dtos/soundTrack.schema.js";
import {authenticate} from "../hooks/authenticate.js";
import {authorize} from "../hooks/authorize.js";
import {Role} from "../../../shared/enums/Role.js";

export async function authRoutes(app: FastifyInstance) {

    app.post("/upload", {
        preHandler: [authenticate, authorize(Role.USER, Role.ADMIN)],
        schema: {
            tags: ["Soundtrack"],
            summary: "Upload a sound for every user",
            body: SoundTrackBody,
            response: {
                200: AuthResponse,
                400: ErrorResponse,
            },
        },
    }, async (request, reply) => {
        const { name, type, zone, ambiance, isUserImported } = request.body as {
            name: string, type: SoundType, zone: Zone | undefined, ambiance : Ambiance | undefined, isUserImported : boolean
        };
        const file = await request.file();

        try {
            const soundTrack = await ImportAudioUseCase.getInstance().execute(file, name, type, zone, ambiance, isUserImported);

            return reply.status(200).send({ soundTrack });
        } catch (err) {
            return reply.status(400).send({ error: (err as Error).message });
        }
    });
}