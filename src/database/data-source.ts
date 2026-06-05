import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const sslEnabled = (process.env.DB_SSL ?? 'false').toLowerCase() === 'true';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: sslEnabled ? { rejectUnauthorized: false } : false,
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  migrationsRun: false,
  synchronize: false,
  logging: process.env.LOG_LEVEL === 'debug' ? ['query', 'error'] : ['error'],
  extra: {
    max: 10,
  },
};

export const AppDataSource = new DataSource(dataSourceOptions);
