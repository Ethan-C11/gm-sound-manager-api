import 'reflect-metadata'
import 'dotenv/config'
import Fastify from 'fastify'
import {AppDataSource} from "./infrastructure/db/AppDataSource.js";
import {registerJwt} from "./presentation/http/plugins/jwt.plugin.js";

const fastify = Fastify({ logger: true })
await registerJwt(fastify);

fastify.get('/', async (request, reply) => {
    return { hello: 'world' }
})

const start = async () => {
    try {
        await AppDataSource.initialize()
        fastify.log.info('Database connected')

        await fastify.listen({
            port: Number(process.env.PORT ?? 3001),
            host: process.env.HOST ?? '127.0.0.1'
        })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start()