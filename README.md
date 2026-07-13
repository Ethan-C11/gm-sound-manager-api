# Backend — GM Sound Manager

Server handling user sessions, audio track selection based on zone/ambiance criteria, real-time playback synchronization, and storage of imported files.

## Technologies

| Tool | Role |
|---|---|
| [Node.js](https://nodejs.org) | Runtime |
| [Fastify](https://fastify.dev) | HTTP framework |
| [TypeScript](https://www.typescriptlang.org) | Static typing |
| [Socket.io](https://socket.io) | Real-time (playback sync, soundboard) |
| [PostgreSQL](https://www.postgresql.org) | Persistence (sessions, audio library) |
| [MinIO](https://min.io) | Audio file storage (S3-compatible) |
| [@fastify/multipart](https://github.com/fastify/fastify-multipart) | Audio file uploads |

## Architecture

Inspired by **Clean Architecture** with selected **DDD** concepts:

```
src/
  domain/
    session/        # Session Aggregate Root, Value Objects (Zone, Ambiance)
    audio/          # AudioTrack Entity, Value Objects
    playback/       # PlaybackCommand, SoundboardEvent (Domain Events)
  application/
    session/        # CreateSessionUseCase, JoinSessionUseCase
    audio/          # ResolveTracksUseCase, ImportAudioUseCase
    playback/       # TriggerPlaybackUseCase, TriggerSoundboardUseCase
  infrastructure/
    db/             # SessionRepository, AudioTrackRepository
    storage/        # MinioStorageService
    realtime/       # SocketIOAdapter
  presentation/
    http/routes/    # Fastify routes (session, audio)
    websocket/      # Socket.io handlers (playback, soundboard)
  shared/
    errors/         # DomainError
    interfaces/     # ISessionRepository, IStorageService, IRealtimeGateway
```

The `domain` and `application` layers have zero dependency on external libraries. Socket.io and MinIO are interchangeable infrastructure details.

## Audio Synchronization

The server is the time authority. On every track change, it broadcasts a command:

```json
{
  "action": "play",
  "trackId": "abc123",
  "serverTimestamp": 1720000000000,
  "offsetMs": 0
}
```

Clients compensate for network latency and align playback via the Web Audio API.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
npm start
```

## Environment Variables

Create a `.env` file at the root:

```env
PORT=3000

DATABASE_URL=postgresql://user:password@localhost:5432/ambient

MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=password
MINIO_BUCKET=audio
```

## Running MinIO Locally

```bash
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  -v /data/minio:/data \
  -e MINIO_ROOT_USER=admin \
  -e MINIO_ROOT_PASSWORD=password \
  minio/minio server /data --console-address ":9001"
```