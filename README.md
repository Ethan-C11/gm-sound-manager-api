# Backend — GM Sound Manager

Server handling user sessions, audio track selection based on zone/ambiance criteria, real-time playback synchronization, and storage of imported files.

## Technologies

| Tool                                                               | Role |
|--------------------------------------------------------------------|---|
| [Node.js](https://nodejs.org)                                      | Runtime |
| [Fastify](https://fastify.dev)                                     | HTTP framework |
| [TypeScript](https://www.typescriptlang.org)                       | Static typing |
| [Socket.io](https://socket.io)                                     | Real-time (playback sync, soundboard) |
| [PostgreSQL](https://www.postgresql.org)                           | Persistence (sessions, audio library) |
| [Garage](https://garagehq.deuxfleurs.fr/)                               | Audio file storage (S3-compatible) |
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
    storage/        # GarageStorageService
    realtime/       # SocketIOAdapter
  presentation/
    http/routes/    # Fastify routes (session, audio)
    websocket/      # Socket.io handlers (playback, soundboard)
  shared/
    errors/         # DomainError
    interfaces/     # ISessionRepository, IStorageService, IRealtimeGateway
```

The `domain` and `application` layers have zero dependency on external libraries. Socket.io and Garage are interchangeable infrastructure details.

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

Run the whole stack in Docker (see [Local Infrastructure](#local-infrastructure)):

```bash
docker compose up -d
```

Or run just the API on the host, against the containerised PostgreSQL and Garage:

```bash
npm run dev
```

Type stripping goes through [tsx](https://tsx.is), which does **not** type-check —
it only strips types. Type errors therefore surface via `tsc`, not at startup:

```bash
npx tsc --noEmit
```

> `ts-node` is not usable here: TypeScript 7 is the native Go port and no longer
> exposes the JavaScript compiler API that `ts-node` is built on.

## Build

```bash
npm run build
npm start
```

> **Not functional yet.** `rootDir` and `outDir` are commented out in
> `tsconfig.json`, so `tsc` emits JavaScript next to the sources in `src/` and
> never populates `dist/` — which is where `npm start` looks. Set both options
> before relying on the production build or the `prod` stage of the Dockerfile.

## Environment Variables

Copy `.env.example` to `.env` and fill in the S3 credentials produced by the
Garage bootstrap below. The file is git-ignored.

```env
PORT=3000
HOST=0.0.0.0

GARAGE_RPC_SECRET=
GARAGE_ADMIN_TOKEN=

DATABASE_URL=postgresql://gm:gm_password@postgres:5432/gm_sound_manager

S3_ENDPOINT=http://garage:3900
S3_REGION=garage
S3_BUCKET=audio
S3_ACCESS_KEY=
S3_SECRET_KEY=
```

`garage.toml` is committed and deliberately holds no secret. The RPC secret and
the admin token are injected from `.env` into the Garage container; generate
each with `openssl rand -hex 32`. Compose refuses to start if either is unset.

`PORT` and `HOST` default to `3001` and `127.0.0.1` when unset. Inside a
container the server must bind `0.0.0.0`, otherwise the published port is
unreachable from the host.

The hostnames `postgres` and `garage` only resolve on the Compose network. To
run the API on the host (`npm run dev`) against the containerised services, use
`localhost:5432` and `http://localhost:3900` instead.

## Local Infrastructure

The Compose stack runs three services: the API, PostgreSQL, and Garage. Fastify,
Socket.io, TypeScript and `@fastify/multipart` are libraries inside the API
container, not separate services — Socket.io shares the Fastify HTTP port.

| Service    | Port                   |
|------------|------------------------|
| API        | 3000                   |
| PostgreSQL | 5432                   |
| Garage     | 3900 (S3 API), 3902 (web), 3903 (admin) |

```bash
docker compose up -d
```

Source edits on the host trigger a reload inside the API container: the watcher
polls, because bind mounts on Windows and macOS do not forward filesystem events
into containers.

### Bootstrapping Garage

Unlike MinIO, Garage takes no credentials from environment variables. A fresh
cluster serves no S3 traffic until a layout is applied and a key is issued. Run
this once, after the first `docker compose up`:

```bash
docker compose exec garage /garage status   # note the node id
docker compose exec garage /garage layout assign -z dc1 -c 1G <node_id>
docker compose exec garage /garage layout apply --version 1
docker compose exec garage /garage bucket create audio
docker compose exec garage /garage key create gm-api-key
docker compose exec garage /garage bucket allow --read --write --owner audio --key gm-api-key
```

Copy the printed key ID and secret into `.env`, then restart the API.

Two caveats. Under Git Bash these commands fail because `/garage` is rewritten
into a Windows path — use PowerShell, or prefix with `MSYS_NO_PATHCONV=1`. And
this state lives in the `garage_meta` / `garage_data` volumes: `docker compose
down -v` destroys it, and the bootstrap has to be repeated.