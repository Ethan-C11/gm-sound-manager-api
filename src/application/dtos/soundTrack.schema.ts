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
        key: Type.String(),
        name: Type.String(),
        type: Type.String(),
        zone: Type.Optional(Type.String()),
        ambiance: Type.Optional(Type.String()),
        isUserImported: Type.Boolean(),
});

export type AudioTrackResponse = Static<typeof AudioTrackResponse>;

export const PaginatedAudioTrackResponse = Type.Object({
    data: Type.Array(AudioTrackResponse),
    total: Type.Number()
});

export type PaginatedAudioTrackResponse = Static<typeof PaginatedAudioTrackResponse>;

export const ListAudioTracksBody = Type.Object({
    type: Type.String(),
    zone: Type.Optional(Type.String()),
    ambiance: Type.Optional(Type.String()),
    isUserImported: Type.Optional(Type.Boolean()),
    offset: Type.Optional(Type.Number()),
    limit: Type.Optional(Type.Number()),
});

export type ListAudioTracksBody = Static<typeof ListAudioTracksBody>;
