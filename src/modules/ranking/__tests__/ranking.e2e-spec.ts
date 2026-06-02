import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { RankingEntry } from '../entities/ranking-entry.entity';

describe('Ranking (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let jwt: JwtService;

  const PERIOD = '2026-06';
  const ME_ID = '11111111-1111-4111-8111-111111111111';
  const ADMIN_ID = '33333333-3333-4333-8333-333333333333';
  const NO_RANK_ID = '44444444-4444-4444-8444-444444444444';

  function bearer(userId: string, roles: string[] = []) {
    return { Authorization: `Bearer ${jwt.sign({ sub: userId, roles })}` };
  }

  async function clearRanking() {
    await dataSource.query('TRUNCATE TABLE "ranking_entries" RESTART IDENTITY CASCADE');
  }

  async function seedTopEntries(count: number) {
    const repo = dataSource.getRepository(RankingEntry);
    for (let i = 1; i <= count; i++) {
      await repo.save(repo.create({
        period: PERIOD,
        userId: i === 1 ? ME_ID : `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
        longestStreak: 10000 - i,
        rank: i,
      }));
    }
  }

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, transformOptions: { enableImplicitConversion: true } }));
    await app.init();
    dataSource = moduleRef.get(DataSource);
    jwt = moduleRef.get(JwtService);
  });

  afterAll(async () => { await clearRanking(); await app.close(); });
  beforeEach(async () => { await clearRanking(); });

  it('GET /ranking returns top 50', async () => {
    await seedTopEntries(60);
    const res = await request(app.getHttpServer()).get('/ranking').query({ period: PERIOD }).set(bearer(ME_ID)).expect(200);
    const list = res.body.data ?? res.body;
    expect(list.length).toBeLessThanOrEqual(50);
  });

  it('GET /ranking/me returns my ranking', async () => {
    await seedTopEntries(5);
    const res = await request(app.getHttpServer()).get('/ranking/me').query({ period: PERIOD }).set(bearer(ME_ID)).expect(200);
    expect((res.body.data ?? res.body).userId).toBe(ME_ID);
  });

  it('GET /ranking/me returns 404 when no ranking', async () => {
    await request(app.getHttpServer()).get('/ranking/me').query({ period: PERIOD }).set(bearer(NO_RANK_ID)).expect(404);
  });

  it('POST /ranking/settle/:period returns 201', async () => {
    await seedTopEntries(5);
    await request(app.getHttpServer()).post(`/ranking/settle/${PERIOD}`).set(bearer(ADMIN_ID, ['admin'])).expect(201);
  });

  it('POST /ranking/settle/:period returns 409 on duplicate', async () => {
    await seedTopEntries(5);
    await request(app.getHttpServer()).post(`/ranking/settle/${PERIOD}`).set(bearer(ADMIN_ID, ['admin'])).expect(201);
    await request(app.getHttpServer()).post(`/ranking/settle/${PERIOD}`).set(bearer(ADMIN_ID, ['admin'])).expect(409);
  });

  it('POST /ranking/update returns 201', async () => {
    await request(app.getHttpServer()).post('/ranking/update').set(bearer(ADMIN_ID, ['admin'])).expect(201);
  });
});
