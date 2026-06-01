import 'dotenv/config';
import { DataSource } from 'typeorm';

/**
 * TypeORM DataSource — 04-data-layer.md 규약.
 * named export 1개만 (TypeORM CLI "must contain only one export" 회피).
 * entities / migrations 는 glob 으로 신규 파일 자동 포함.
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
