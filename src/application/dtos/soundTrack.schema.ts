import { Type, Static } from "@fastify/type-provider-typebox";


export const SoundTrackBody = Type.Object({
    file: Type.Any(),
    name: Type.String(),
    type: Type.String(),
    zone: Type.Optional(Type.String()),
    ambiance: Type.Optional(Type.String()),
    isUserImported: Type.Boolean(),
});
export type SoundTrackBody = Static<typeof SoundTrackBody>;


export const SoundTrackResponse = Type.Object({
    soundTrack: Type.Object({
        key: Type.String(),
        name: Type.String(),
        type: Type.String(),
        zone: Type.Optional(Type.String()),
        ambiance: Type.Optional(Type.String()),
        isUserImported: Type.Boolean(),
    }),
});

export type SoundTrackResponse = Static<typeof SoundTrackResponse>;


