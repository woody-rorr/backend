import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';

loadEnv();

/**
 * Single source of truth for TypeORM connection + migrations.
 * Used by:
 *  - dev CLI:  typeorm-ts-node-commonjs -d src/database/data-source.ts
 *  - prod CLI: node ./node_modules/typeorm/cli.js -d dist/database/data-source.js
 *  - app:      TypeOrmModule.forRoot(AppDataSource.options)
 *
 * NOTE: exactly ONE DataSource export (TypeORM CLI rejects named + default).
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  // glob: new entities/migrations are picked up automatically
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
  logging: false,
});
