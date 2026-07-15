// ESM
import Fastify from 'fastify'

const fastify = Fastify({
    logger: true
})

fastify.get('/', async (request, reply) => {
    return { hello: 'world' }
})

/**
 * Run the server!
 */
const start = async () => {
    try {
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