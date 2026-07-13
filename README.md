# Backend — GM Sound Manager

Serveur gérant les sessions utilisateurs, la sélection des pistes audio selon les critères zone/ambiance, la synchronisation temps réel du playback et le stockage des fichiers importés.

## Technologies

| Outil | Rôle |
|---|---|
| [Node.js](https://nodejs.org) | Runtime |
| [Fastify](https://fastify.dev) | Framework HTTP |
| [TypeScript](https://www.typescriptlang.org) | Typage statique |
| [Socket.io](https://socket.io) | Temps réel (sync playback, soundboard) |
| [PostgreSQL](https://www.postgresql.org) | Persistance (sessions, bibliothèque audio) |
| [MinIO](https://min.io) | Stockage des fichiers audio (compatible S3) |
| [@fastify/multipart](https://github.com/fastify/fastify-multipart) | Upload de fichiers audio |

## Architecture

Inspirée de la **Clean Architecture** avec quelques concepts **DDD** :

```
src/
  domain/
    session/        # Aggregate Session, Value Objects (Zone, Ambiance)
    audio/          # Entity AudioTrack, Value Objects
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
    http/routes/    # Routes Fastify (session, audio)
    websocket/      # Handlers Socket.io (playback, soundboard)
  shared/
    errors/         # DomainError
    interfaces/     # ISessionRepository, IStorageService, IRealtimeGateway
```

Les couches `domain` et `application` ne dépendent d'aucune lib externe. Socket.io et MinIO sont des détails d'infrastructure interchangeables.

## Synchronisation audio

Le serveur est l'autorité temporelle. À chaque changement de piste, il broadcast une commande :

```json
{
  "action": "play",
  "trackId": "abc123",
  "serverTimestamp": 1720000000000,
  "offsetMs": 0
}
```

Les clients compensent le décalage réseau et alignent la lecture via l'API Web Audio.

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

## Build

```bash
npm run build
npm start
```

## Variables d'environnement

Créer un fichier `.env` à la racine :

```env
PORT=3000

DATABASE_URL=postgresql://user:password@localhost:5432/ambient

MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=motdepasse
MINIO_BUCKET=audio
```

## Lancer MinIO localement

```bash
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  -v /data/minio:/data \
  -e MINIO_ROOT_USER=admin \
  -e MINIO_ROOT_PASSWORD=motdepasse \
  minio/minio server /data --console-address ":9001"
```