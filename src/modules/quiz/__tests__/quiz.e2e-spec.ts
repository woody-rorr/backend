import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, authToken, resetQuizzes } from './helpers';

/**
 * e2e for QuizController (extra_spec: module:quiz).
 * Covers 08-testing.md §6 mandatory items that apply to this module:
 *  - every controller method -> >=1 success e2e
 *  - auth guard -> 401 case
 *  - validation failure -> 400 case (invalid enum, invalid uuid)
 *  - not-found -> 404 { code: QUIZ_NOT_FOUND }
 *
 * No DB mock (08-testing.md §3). Table is truncated before each test.
 */
describe('QuizController (e2e)', () => {
  let app: INestApplication;
  let token: string;

  // A well-formed uuid that is guaranteed not to exist after truncation.
  const MISSING_ID = '11111111-1111-1111-1111-111111111111';

  const validBody = {
    title: 'Sample Quiz',
    description: 'A quiz for testing',
    difficulty: 'EASY',
  };

  const auth = () => ({ Authorization: `Bearer ${token}` });

  async function createQuiz(overrides: Record<string, unknown> = {}) {
    const res = await request(app.getHttpServer())
      .post('/quizzes')
      .set(auth())
      .send({ ...validBody, ...overrides })
      .expect(201);
    return res.body.data ?? res.body;
  }

  beforeAll(async () => {
    app = await createTestApp();
    token = authToken(app);
  });

  beforeEach(async () => {
    await resetQuizzes(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('auth guard (JwtAuthGuard, APP_GUARD)', () => {
    it('rejects POST /quizzes without a token with 401', async () => {
      await request(app.getHttpServer())
        .post('/quizzes')
        .send(validBody)
        .expect(401)
        .expect(({ body }) => expect(body.code).toBe('UNAUTHORIZED'));
    });

    it('rejects GET /quizzes without a token with 401', async () => {
      await request(app.getHttpServer()).get('/quizzes').expect(401);
    });
  });

  describe('POST /quizzes', () => {
    it('creates a quiz and returns 201 with the resource', async () => {
      const res = await request(app.getHttpServer())
        .post('/quizzes')
        .set(auth())
        .send(validBody)
        .expect(201);

      const quiz = res.body.data ?? res.body;
      expect(quiz).toMatchObject({
        id: expect.any(String),
        title: 'Sample Quiz',
        description: 'A quiz for testing',
        difficulty: 'EASY',
        questionCount: 0,
        isActive: true,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('creates a quiz without optional description', async () => {
      const quiz = await createQuiz({ description: undefined });
      expect(quiz.title).toBe('Sample Quiz');
    });

    it('rejects an invalid difficulty enum with 400', async () => {
      await request(app.getHttpServer())
        .post('/quizzes')
        .set(auth())
        .send({ ...validBody, difficulty: 'IMPOSSIBLE' })
        .expect(400)
        .expect(({ body }) => expect(body.code).toBe('VALIDATION_ERROR'));
    });

    it('rejects a missing required title with 400', async () => {
      const { title, ...noTitle } = validBody;
      await request(app.getHttpServer())
        .post('/quizzes')
        .set(auth())
        .send(noTitle)
        .expect(400);
    });
  });

  describe('GET /quizzes', () => {
    it('returns a paginated list with meta', async () => {
      await createQuiz({ title: 'Q1' });
      await createQuiz({ title: 'Q2' });

      const res = await request(app.getHttpServer())
        .get('/quizzes?page=1&limit=20')
        .set(auth())
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.meta).toMatchObject({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: expect.any(Number),
      });
    });

    it('filters by difficulty', async () => {
      await createQuiz({ title: 'Easy one', difficulty: 'EASY' });
      await createQuiz({ title: 'Hard one', difficulty: 'HARD' });

      const res = await request(app.getHttpServer())
        .get('/quizzes?difficulty=HARD')
        .set(auth())
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].difficulty).toBe('HARD');
    });
  });

  describe('GET /quizzes/:id', () => {
    it('returns the quiz by id with 200', async () => {
      const created = await createQuiz();
      const res = await request(app.getHttpServer())
        .get(`/quizzes/${created.id}`)
        .set(auth())
        .expect(200);
      const quiz = res.body.data ?? res.body;
      expect(quiz.id).toBe(created.id);
    });

    it('returns 404 QUIZ_NOT_FOUND for a non-existent id', async () => {
      await request(app.getHttpServer())
        .get(`/quizzes/${MISSING_ID}`)
        .set(auth())
        .expect(404)
        .expect(({ body }) => expect(body.code).toBe('QUIZ_NOT_FOUND'));
    });

    it('returns 400 for an invalid uuid format', async () => {
      await request(app.getHttpServer())
        .get('/quizzes/not-a-uuid')
        .set(auth())
        .expect(400);
    });
  });

  describe('PATCH /quizzes/:id', () => {
    it('updates the quiz and returns 200', async () => {
      const created = await createQuiz();
      const res = await request(app.getHttpServer())
        .patch(`/quizzes/${created.id}`)
        .set(auth())
        .send({ title: 'Updated title', isActive: false })
        .expect(200);
      const quiz = res.body.data ?? res.body;
      expect(quiz.title).toBe('Updated title');
      expect(quiz.isActive).toBe(false);
    });

    it('returns 404 QUIZ_NOT_FOUND for a non-existent id', async () => {
      await request(app.getHttpServer())
        .patch(`/quizzes/${MISSING_ID}`)
        .set(auth())
        .send({ title: 'whatever' })
        .expect(404)
        .expect(({ body }) => expect(body.code).toBe('QUIZ_NOT_FOUND'));
    });

    it('rejects an invalid difficulty enum with 400', async () => {
      const created = await createQuiz();
      await request(app.getHttpServer())
        .patch(`/quizzes/${created.id}`)
        .set(auth())
        .send({ difficulty: 'EXTREME' })
        .expect(400);
    });

    it('returns 400 for an invalid uuid format', async () => {
      await request(app.getHttpServer())
        .patch('/quizzes/not-a-uuid')
        .set(auth())
        .send({ title: 'x' })
        .expect(400);
    });
  });

  describe('DELETE /quizzes/:id', () => {
    it('deletes the quiz and returns 204', async () => {
      const created = await createQuiz();
      await request(app.getHttpServer())
        .delete(`/quizzes/${created.id}`)
        .set(auth())
        .expect(204);

      await request(app.getHttpServer())
        .get(`/quizzes/${created.id}`)
        .set(auth())
        .expect(404);
    });

    it('returns 404 QUIZ_NOT_FOUND for a non-existent id', async () => {
      await request(app.getHttpServer())
        .delete(`/quizzes/${MISSING_ID}`)
        .set(auth())
        .expect(404)
        .expect(({ body }) => expect(body.code).toBe('QUIZ_NOT_FOUND'));
    });

    it('returns 400 for an invalid uuid format', async () => {
      await request(app.getHttpServer())
        .delete('/quizzes/not-a-uuid')
        .set(auth())
        .expect(400);
    });
  });
});
