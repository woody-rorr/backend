import 'dotenv/config';
import { DataSource } from 'typeorm';

const toBool = (v?: string): boolean => v === 'true' || v === '1';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: toBool(process.env.DB_SSL) ? { rejectUnauthorized: false } : false,
  synchronize: false,
  logging: false,
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  poolSize: 10,
});
