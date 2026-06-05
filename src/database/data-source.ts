import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';

/**
 * Single TypeORM DataSource for the project.
 *
 * - Consumed by `app.module.ts` via `TypeOrmModule.forRootAsync({ useFactory: () => AppDataSource.options })`.
 * - Consumed by the TypeORM CLI (`typeorm migration:run` / `migration:revert`).
 *
 * `__dirname` resolves to `dist/database` under compiled JS (prod) and `src/database`
 * under ts-node (dev/CLI), so the globs below cover both contexts without env branching.
 *
 * NOTE: exactly ONE export of a DataSource instance (named `AppDataSource`).
 * Adding a `default` export as well breaks the TypeORM CLI loader
 * ("Given data source file must contain only one export of DataSource instance").
 */
const rootDir = path.join(__dirname, '..');

const useUrl = Boolean(process.env.DATABASE_URL);
const sslEnabled = process.env.DB_SSL === 'true';

const connection: DataSourceOptions = {
  type: 'postgres',
  ...(useUrl
    ? { url: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST ?? 'localhost',
        port: parseInt(process.env.DB_PORT ?? '5432', 10),
        username: process.env.DB_USER ?? 'postgres',
        password: process.env.DB_PASSWORD ?? '',
        database: process.env.DB_NAME ?? 'backend',
      }),
  // Cover both compiled (dist) and ts-node (src) execution contexts.
  entities: [
    path.join(rootDir, '**', '*.entity.js'),
    path.join(rootDir, '**', '*.entity.ts'),
  ],
  migrations: [
    path.join(rootDir, 'database', 'migrations', '*.js'),
    path.join(rootDir, 'database', 'migrations', '*.ts'),
  ],
  synchronize: false,
  migrationsRun: false,
  logging: process.env.LOG_LEVEL === 'debug',
  ssl: sslEnabled ? { rejectUnauthorized: false } : false,
} as DataSourceOptions;

export const AppDataSource = new DataSource(connection);
