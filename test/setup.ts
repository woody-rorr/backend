import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import * as request from 'supertest';

export async function createTestApp(): Promise<INestApplication> {
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, transformOptions: { enableImplicitConversion: true } }));
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.init();
  return app;
}

let userSeq = 0;
export async function createUserAndToken(app: INestApplication, overrides: Partial<{ email: string; password: string; name: string }> = {}): Promise<{ accessToken: string; userId: string; email: string }> {
  userSeq += 1;
  const email = overrides.email ?? `quiz-e2e-${userSeq}-${process.pid}@example.com`;
  const password = overrides.password ?? 'Passw0rd!';
  const name = overrides.name ?? `quiz-user-${userSeq}`;
  const res = await request(app.getHttpServer()).post('/api/auth/signup').send({ email, password, name }).expect(201);
  const accessToken: string = res.body.accessToken ?? res.body.data?.accessToken;
  const userId: string = res.body.user?.id ?? res.body.data?.user?.id;
  return { accessToken, userId, email };
}

export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}
