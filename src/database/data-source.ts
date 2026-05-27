import { DataSource } from 'typeorm';
import { config as loadEnv } from 'dotenv';

loadEnv();
const dbSsl = process.env.DB_SSL === 'true';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: dbSsl ? { rejectUnauthorized: false } : false,
  synchronize: false,
  logging: ['error', 'warn'],
  entities: ['dist/**/*.entity.js', 'src/**/*.entity.{ts,js}'],
  migrations: ['dist/database/migrations/*.js', 'src/database/migrations/*.ts'],
});

export default AppDataSource;
