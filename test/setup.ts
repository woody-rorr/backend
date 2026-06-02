import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

/**
 * Global e2e setup helpers (08-testing.md §4 / §5).
 * - Boots the real Nest app against the real Postgres test DB (no DB mocks).
 * - Provides a single shared app + DataSource handle for module-scoped specs.
 */
export interface E2EContext {
  app: INestApplication;
  dataSource: DataSource;
}

export async function createTestApp(): Promise<E2EContext> {
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  await app.init();

  const dataSource = app.get(DataSource);
  return { app, dataSource };
}

/**
 * Truncate domain tables between specs to keep cases independent
 * (08-testing.md §9 — no inter-test dependency).
 */
export async function resetDatabase(dataSource: DataSource): Promise<void> {
  await dataSource.query(
    'TRUNCATE TABLE "payments" RESTART IDENTITY CASCADE',
  );
  await dataSource.query(
    'TRUNCATE TABLE "users" RESTART IDENTITY CASCADE',
  );
}
