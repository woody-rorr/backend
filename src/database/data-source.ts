import 'reflect-metadata';
import { DataSource } from 'typeorm';

/**
 * TypeORM DataSource — used by both the Nest runtime (via
 * TypeOrmModule.forRoot(AppDataSource.options)) and the TypeORM CLI for
 * migrations. Only ONE export of a DataSource instance is allowed (db_migration.md §6).
 *
 * Env vars: 07-env-and-secrets.md §1.
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
  logging: ['error', 'warn'],
  poolSize: 10,
});
