import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, createUserAndToken, authHeader } from '../../../../test/setup';

describe('Quiz (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => { app = await createTestApp(); });
  afterAll(async () => { await app.close(); });

  const MATCH_ID = 'test-match-001';
  const submitPayload = (over: Record<string, unknown> = {}) => ({ matchId: MATCH_ID, predictedWinner: 'TeamA', ...over });

  describe('POST /quiz/submit', () => {
    it('201 성공', async () => {
      const { accessToken } = await createUserAndToken(app);
      const res = await request(app.getHttpServer()).post('/quiz/submit').set(authHeader(accessToken)).send(submitPayload()).expect(201);
      expect(res.body).toMatchObject({ id: expect.any(String) });
    });
    it('409 중복 제출', async () => {
      const { accessToken } = await createUserAndToken(app);
      await request(app.getHttpServer()).post('/quiz/submit').set(authHeader(accessToken)).send(submitPayload()).expect(201);
      const res = await request(app.getHttpServer()).post('/quiz/submit').set(authHeader(accessToken)).send(submitPayload()).expect(409);
      expect(typeof res.body.code).toBe('string');
    });
    it('401 미인증', async () => { await request(app.getHttpServer()).post('/quiz/submit').send(submitPayload()).expect(401); });
  });

  describe('POST /quiz/settle', () => {
    it('isCorrect 판정 + streak 증가', async () => {
      const { accessToken } = await createUserAndToken(app);
      await request(app.getHttpServer()).post('/quiz/submit').set(authHeader(accessToken)).send(submitPayload()).expect(201);
      const res = await request(app.getHttpServer()).post('/quiz/settle').set(authHeader(accessToken)).send({ matchId: MATCH_ID, actualWinner: 'TeamA' }).expect(200);
      expect(res.body).toMatchObject({ isCorrect: true });
    });
    it('오답이면 streak 0 초기화', async () => {
      const { accessToken } = await createUserAndToken(app);
      await request(app.getHttpServer()).post('/quiz/submit').set(authHeader(accessToken)).send(submitPayload()).expect(201);
      const res = await request(app.getHttpServer()).post('/quiz/settle').set(authHeader(accessToken)).send({ matchId: MATCH_ID, actualWinner: 'TeamB' }).expect(200);
      expect(res.body).toMatchObject({ isCorrect: false });
    });
    it('401 미인증', async () => { await request(app.getHttpServer()).post('/quiz/settle').send({ matchId: MATCH_ID, actualWinner: 'TeamA' }).expect(401); });
  });

  describe('GET /quiz/history', () => {
    it('페이지네이션', async () => {
      const { accessToken } = await createUserAndToken(app);
      await request(app.getHttpServer()).post('/quiz/submit').set(authHeader(accessToken)).send(submitPayload()).expect(201);
      const res = await request(app.getHttpServer()).get('/quiz/history?page=1&limit=20').set(authHeader(accessToken)).expect(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toMatchObject({ page: 1, limit: 20, total: expect.any(Number), totalPages: expect.any(Number) });
    });
    it('401 미인증', async () => { await request(app.getHttpServer()).get('/quiz/history').expect(401); });
  });

  describe('GET /quiz/streak', () => {
    it('streak 조회', async () => {
      const { accessToken } = await createUserAndToken(app);
      const res = await request(app.getHttpServer()).get('/quiz/streak').set(authHeader(accessToken)).expect(200);
      expect(res.body).toMatchObject({ currentStreak: expect.any(Number), longestStreak: expect.any(Number) });
    });
    it('401 미인증', async () => { await request(app.getHttpServer()).get('/quiz/streak').expect(401); });
  });
});
