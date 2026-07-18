import { Type, Static } from "@fastify/type-provider-typebox";


export const AudioTrackBody = Type.Any();
export type AudioTrackBody = Static<typeof AudioTrackBody>;


export const AudioTrackResponse = Type.Object({
    audioTrack: Type.Object({
        key: Type.String(),
        name: Type.String(),
        type: Type.String(),
        zone: Type.Optional(Type.String()),
        ambiance: Type.Optional(Type.String()),
        isUserImported: Type.Boolean(),
    }),
});

export type AudioTrackResponse = Static<typeof AudioTrackResponse>;


