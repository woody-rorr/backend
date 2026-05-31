import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { AppModule } from '../../../app.module';
import { AllExceptionsFilter } from '../../../common/filters/all-exceptions.filter';

/**
 * Bootstraps a real Nest application backed by the real (test) database.
 * Mirrors src/main.ts global setup so e2e assertions on error/response
 * shape (06-runtime-rules.md §1, §4) match production behaviour.
 *
 * DB is NOT mocked (08-testing.md §3). Point env at the dedicated test DB
 * (e.g. backend_test) or a testcontainers Postgres before running.
 */
export async function createTestApp(): Promise<INestApplication> {
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
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.init();
  return app;
}

/**
 * Issues a valid Bearer JWT for an authenticated test user.
 * Payload follows 06-runtime-rules.md §2 / auth_patterns.md §2.
 */
export function authToken(
  app: INestApplication,
  overrides: Partial<{ sub: string; email: string; roles: string[] }> = {},
): string {
  const jwt = app.get(JwtService);
  return jwt.sign({
    sub: overrides.sub ?? '00000000-0000-0000-0000-0000000000aa',
    email: overrides.email ?? 'tester@example.com',
    roles: overrides.roles ?? [],
  });
}

/** Truncates the quizzes table so each test starts from a clean slate. */
export async function resetQuizzes(app: INestApplication): Promise<void> {
  const dataSource = app.get(DataSource);
  await dataSource.query('TRUNCATE TABLE quizzes RESTART IDENTITY CASCADE');
}
