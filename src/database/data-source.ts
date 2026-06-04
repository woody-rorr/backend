import 'reflect-metadata';
import { DataSource } from 'typeorm';

/**
 * TypeORM DataSource — used by both the Nest runtime
 * (`TypeOrmModule.forRoot(AppDataSource.options)`) and the TypeORM CLI
 * (`-d src/database/data-source.ts` in dev, `-d dist/database/data-source.js` in prod).
 *
 * Env is supplied by the container (ECS task-def / SSM) or by direnv/dotenv locally.
 * Per 07-env-and-secrets.md §1 — only declared variables are read.
 * Exactly ONE export of a DataSource instance (db_migration.md §6).
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  // glob — new entities/migrations are picked up automatically (app_module_integration.md §2)
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
  logging: false,
});
