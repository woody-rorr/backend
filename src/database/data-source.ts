import 'dotenv/config';
import { DataSource } from 'typeorm';

const toBool = (v: string | undefined, def = false): boolean =>
  v === undefined ? def : v.toLowerCase() === 'true';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: toBool(process.env.DB_SSL) ? { rejectUnauthorized: false } : false,
  synchronize: false,
  logging: process.env.LOG_LEVEL === 'debug',
  poolSize: 10,
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
});
