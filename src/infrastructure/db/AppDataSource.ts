import { DataSource } from 'typeorm'

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: ['src/infrastructure/db/entities/*.ts'],
    migrations: ['src/infrastructure/db/migrations/*.ts'],
    synchronize: true,
})