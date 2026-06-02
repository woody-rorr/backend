import 'dotenv/config';
import { DataSource } from 'typeorm';

/**
 * TypeORM data source (04-data-layer.md, 07-env-and-secrets.md).
 * Single DataSource export only — TypeORM CLI rejects dual named+default export.
 * entities / migrations use globs so new files are picked up automatically.
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
  logging: false,
});
