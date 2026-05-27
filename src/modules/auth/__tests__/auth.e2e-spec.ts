import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { AllExceptionsFilter } from '../../../common/filters/all-exceptions.filter';
import { LoggingInterceptor } from '../../../common/interceptors/logging.interceptor';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  const validUser = { email: 'u@e.com', password: 'Passw0rd!', name: 'U' };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, transformOptions: { enableImplicitConversion: true } }));
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new LoggingInterceptor());
    await app.init();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    if (app) await app.close();
    if (dataSource && dataSource.isInitialized) await dataSource.destroy();
  });

  beforeEach(async () => { await dataSource.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE'); });

  describe('POST /auth/signup', () => {
    it('creates user and returns access token', async () => {
      const res = await request(app.getHttpServer()).post('/auth/signup').send(validUser).expect(201);
      expect(res.body).toMatchObject({
        accessToken: expect.any(String),
        user: { id: expect.any(String), email: validUser.email, name: validUser.name, createdAt: expect.any(String) },
      });
      expect(res.body.user.passwordHash).toBeUndefined();
      expect(res.body.passwordHash).toBeUndefined();
    });
    it('rejects duplicate email with 409 EMAIL_EXISTS', async () => {
      await request(app.getHttpServer()).post('/auth/signup').send(validUser).expect(201);
      await request(app.getHttpServer()).post('/auth/signup').send({ ...validUser, name: 'Other' }).expect(409)
        .expect(({ body }) => expect(body.code).toBe('EMAIL_EXISTS'));
    });
    it('rejects invalid email format with 400', async () => {
      await request(app.getHttpServer()).post('/auth/signup').send({ ...validUser, email: 'not-an-email' }).expect(400)
        .expect(({ body }) => expect(body.code).toBe('VALIDATION_ERROR'));
    });
    it('rejects password shorter than 8 chars with 400', async () => {
      await request(app.getHttpServer()).post('/auth/signup').send({ ...validUser, password: 'Ab1!' }).expect(400)
        .expect(({ body }) => expect(body.code).toBe('VALIDATION_ERROR'));
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => { await request(app.getHttpServer()).post('/auth/signup').send(validUser).expect(201); });
    it('returns access token on valid credentials', async () => {
      const res = await request(app.getHttpServer()).post('/auth/login').send({ email: validUser.email, password: validUser.password }).expect(200);
      expect(res.body).toMatchObject({ accessToken: expect.any(String), user: { email: validUser.email, name: validUser.name } });
      expect(res.body.user.passwordHash).toBeUndefined();
    });
    it('returns 401 INVALID_CREDENTIALS for wrong password', async () => {
      await request(app.getHttpServer()).post('/auth/login').send({ email: validUser.email, password: 'WrongPass1!' }).expect(401)
        .expect(({ body }) => expect(body.code).toBe('INVALID_CREDENTIALS'));
    });
    it('returns 401 INVALID_CREDENTIALS for unknown email', async () => {
      await request(app.getHttpServer()).post('/auth/login').send({ email: 'unknown@e.com', password: validUser.password }).expect(401)
        .expect(({ body }) => expect(body.code).toBe('INVALID_CREDENTIALS'));
    });
  });
});
