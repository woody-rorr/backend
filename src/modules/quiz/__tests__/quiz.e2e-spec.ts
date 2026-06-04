import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { AllExceptionsFilter } from '../../../common/filters/all-exceptions.filter';

describe('Quiz (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userToken: string;
  let userId: string;
  let otherToken: string;
  let otherId: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
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

    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await dataSource.query(
      'TRUNCATE TABLE "user_quiz_answers", "user_streaks", "quizzes", "users" RESTART IDENTITY CASCADE',
    );

    const u = await signup('player@e.com', 'Player');
    userToken = u.token;
    userId = u.id;

    const o = await signup('other@e.com', 'Other');
    otherToken = o.token;
    otherId = o.id;
  });

  async function signup(email: string, name: string) {
    const res = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({ email, password: 'Passw0rd!', name })
      .expect(201);
    return { token: res.body.accessToken as string, id: res.body.user.id as string };
  }

  async function seedQuiz(opts: {
    id?: string;
    question?: string;
    correctAnswer?: string;
    deadline?: Date;
  } = {}): Promise<string> {
    const question = opts.question ?? 'What is 2 + 2?';
    const correct = opts.correctAnswer ?? '4';
    const deadline = opts.deadline ?? new Date(Date.now() + 60 * 60 * 1000);
    const rows = await dataSource.query(
      `INSERT INTO "quizzes" ("match_id", "question", "options", "correct_answer", "deadline")
       VALUES ($1, $2, $3, $4, $5) RETURNING "id"`,
      ['match-1', question, JSON.stringify(['1', '2', '3', '4']), correct, deadline.toISOString()],
    );
    return rows[0].id;
  }

  function submitAnswer(token: string, quizId: string, answer: string) {
    return request(app.getHttpServer())
      .post(`/api/quiz/${quizId}/answer`)
      .set('Authorization', `Bearer ${token}`)
      .send({ answer });
  }

  describe('POST /api/quiz/:id/answer — duplicate submission', () => {
    it('rejects a second answer from the same user with 409', async () => {
      const quizId = await seedQuiz();
      await submitAnswer(userToken, quizId, '4').expect(201);
      await submitAnswer(userToken, quizId, '4')
        .expect(409)
        .expect(({ body }) => {
          expect(body.code).toBe('ALREADY_ANSWERED');
        });
    });

    it('allows different users to answer the same quiz', async () => {
      const quizId = await seedQuiz();
      await submitAnswer(userToken, quizId, '4').expect(201);
      await submitAnswer(otherToken, quizId, '4').expect(201);
      const count = await dataSource.query(
        'SELECT COUNT(*)::int AS c FROM "user_quiz_answers" WHERE "quiz_id" = $1',
        [quizId],
      );
      expect(count[0].c).toBe(2);
    });

    it('requires authentication (401)', async () => {
      const quizId = await seedQuiz();
      await request(app.getHttpServer())
        .post(`/api/quiz/${quizId}/answer`)
        .send({ answer: '4' })
        .expect(401);
    });
  });

  describe('streak update on answer', () => {
    it('increments currentStreak and longestStreak on consecutive correct answers', async () => {
      const q1 = await seedQuiz({ correctAnswer: '4' });
      const q2 = await seedQuiz({ correctAnswer: '4' });
      const q3 = await seedQuiz({ correctAnswer: '4' });
      const r1 = await submitAnswer(userToken, q1, '4').expect(201);
      expect(r1.body.isCorrect).toBe(true);
      expect(r1.body.currentStreak).toBe(1);
      expect(r1.body.longestStreak).toBe(1);
      const r2 = await submitAnswer(userToken, q2, '4').expect(201);
      expect(r2.body.currentStreak).toBe(2);
      expect(r2.body.longestStreak).toBe(2);
      const r3 = await submitAnswer(userToken, q3, '4').expect(201);
      expect(r3.body.currentStreak).toBe(3);
      expect(r3.body.longestStreak).toBe(3);
    });

    it('resets currentStreak to 0 on a wrong answer but keeps longestStreak', async () => {
      const q1 = await seedQuiz({ correctAnswer: '4' });
      const q2 = await seedQuiz({ correctAnswer: '4' });
      const q3 = await seedQuiz({ correctAnswer: '4' });
      await submitAnswer(userToken, q1, '4').expect(201);
      await submitAnswer(userToken, q2, '4').expect(201);
      const wrong = await submitAnswer(userToken, q3, '5').expect(201);
      expect(wrong.body.isCorrect).toBe(false);
      expect(wrong.body.currentStreak).toBe(0);
      expect(wrong.body.longestStreak).toBe(2);
    });
  });

  describe('deadline enforcement', () => {
    it('rejects an answer submitted after the deadline with 422', async () => {
      const quizId = await seedQuiz({
        deadline: new Date(Date.now() - 60 * 1000),
      });
      await submitAnswer(userToken, quizId, '4')
        .expect(422)
        .expect(({ body }) => {
          expect(body.code).toBe('QUIZ_DEADLINE_PASSED');
        });
    });
  });

  describe('GET /api/quiz/active', () => {
    it('marks answered quizzes for the requesting user', async () => {
      const answeredQuiz = await seedQuiz({ question: 'Answered one', correctAnswer: '4' });
      const openQuiz = await seedQuiz({ question: 'Open one', correctAnswer: '4' });
      await submitAnswer(userToken, answeredQuiz, '4').expect(201);
      const res = await request(app.getHttpServer())
        .get('/api/quiz/active')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
      const byId: Record<string, boolean> = {};
      for (const item of res.body.data ?? res.body) byId[item.id] = item.answered;
      expect(byId[answeredQuiz]).toBe(true);
      expect(byId[openQuiz]).toBe(false);
    });

    it('requires authentication (401)', async () => {
      await request(app.getHttpServer()).get('/api/quiz/active').expect(401);
    });
  });
});
