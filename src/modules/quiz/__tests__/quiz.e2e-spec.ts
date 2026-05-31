import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

const createQuizPayload = (): Record<string, unknown> => ({});
const updateQuizPayload = (): Record<string, unknown> => ({});

const NON_EXISTENT_ID = '00000000-0000-0000-0000-000000000000';

describe('Quiz (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createApplication
      ? moduleRef.createApplication()
      : moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    await app.init();
    dataSource = moduleRef.get(DataSource);
  });

  beforeEach(async () => {
    await dataSource.query('TRUNCATE TABLE quizzes RESTART IDENTITY CASCADE');
  });

  afterAll(async () => {
    await app.close();
  });

  const createQuiz = async () => {
    const res = await request(app.getHttpServer())
      .post('/quizzes')
      .send(createQuizPayload())
      .expect(201);
    return res.body;
  };

  describe('POST /quizzes', () => {
    it('creates a quiz and returns 201 + QuizResponseDto', async () => {
      const res = await request(app.getHttpServer())
        .post('/quizzes')
        .send(createQuizPayload())
        .expect(201);

      expect(res.body).toMatchObject({
        id: expect.any(String),
        createdAt: expect.any(String),
      });
    });
  });

  describe('GET /quizzes', () => {
    it('returns 200 with pagination meta', async () => {
      await createQuiz();

      const res = await request(app.getHttpServer())
        .get('/quizzes')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toMatchObject({
        page: 1,
        limit: 10,
        total: expect.any(Number),
        totalPages: expect.any(Number),
      });
    });
  });

  describe('GET /quizzes/:id', () => {
    it('returns 200 when the quiz exists', async () => {
      const created = await createQuiz();

      const res = await request(app.getHttpServer())
        .get(`/quizzes/${created.id}`)
        .expect(200);

      expect(res.body).toMatchObject({ id: created.id });
    });

    it('returns 404 QUIZ_NOT_FOUND when the quiz does not exist', async () => {
      const res = await request(app.getHttpServer())
        .get(`/quizzes/${NON_EXISTENT_ID}`)
        .expect(404);

      expect(res.body.code).toBe('QUIZ_NOT_FOUND');
    });
  });

  describe('PATCH /quizzes/:id', () => {
    it('returns 200 when the quiz exists', async () => {
      const created = await createQuiz();

      const res = await request(app.getHttpServer())
        .patch(`/quizzes/${created.id}`)
        .send(updateQuizPayload())
        .expect(200);

      expect(res.body).toMatchObject({ id: created.id });
    });

    it('returns 404 QUIZ_NOT_FOUND when the quiz does not exist', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/quizzes/${NON_EXISTENT_ID}`)
        .send(updateQuizPayload())
        .expect(404);

      expect(res.body.code).toBe('QUIZ_NOT_FOUND');
    });
  });

  describe('DELETE /quizzes/:id', () => {
    it('returns 204 when the quiz exists', async () => {
      const created = await createQuiz();

      await request(app.getHttpServer())
        .delete(`/quizzes/${created.id}`)
        .expect(204);
    });

    it('returns 404 QUIZ_NOT_FOUND when the quiz does not exist', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/quizzes/${NON_EXISTENT_ID}`)
        .expect(404);

      expect(res.body.code).toBe('QUIZ_NOT_FOUND');
    });
  });
});
