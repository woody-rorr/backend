import 'dotenv/config';
import { DataSource } from 'typeorm';

/**
 * TypeORM DataSource (single export — required by TypeORM CLI loader).
 * entities / migrations are resolved by glob so newly added files are
 * picked up automatically without editing this file.
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
  extra: {
    max: 10,
  },
});
