import 'reflect-metadata';
import { DataSource } from 'typeorm';

/**
 * TypeORM DataSource — 04-data-layer.md / db_migration.md 규약.
 * DataSource는 정확히 한 번만 export (named export only).
 * entities / migrations 는 glob 으로 신규 파일 자동 포함.
 */
const isTrue = (v?: string): boolean => v === 'true' || v === '1';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: isTrue(process.env.DB_SSL) ? { rejectUnauthorized: false } : false,
  synchronize: false,
  logging: false,
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
});
