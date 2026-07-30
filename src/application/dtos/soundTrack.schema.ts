import { Type, Static } from "@fastify/type-provider-typebox";


export const ImportAudioTrackBody = Type.Any();
export type ImportAudioTrackBody = Static<typeof ImportAudioTrackBody>;

export const ResolveAudioTrackBody = Type.Object({
        sessionId: Type.String(),
        type: Type.String(),
        zone: Type.Optional(Type.String()),
        ambiance: Type.Optional(Type.String()),
});
export type ResolveAudioTrackBody = Static<typeof ResolveAudioTrackBody>;


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


