import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { randomUUID } from 'crypto';
import { AppModule } from '../../../app.module';

describe('Spark (e2e)', () => {
  let app: INestApplication;
  let jwt: JwtService;
  let dataSource: DataSource;

  const memberId = randomUUID();
  const targetId = randomUUID();
  const adminId = randomUUID();

  const tokenFor = (id: string, roles: string[] = []): string =>
    jwt.sign({ sub: id, email: `${id}@e.com`, roles });

  const memberToken = (): string => tokenFor(memberId, []);
  const adminToken = (): string => tokenFor(adminId, ['admin']);

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
    await app.init();

    jwt = app.get(JwtService);
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await dataSource.query(
      'TRUNCATE TABLE spark_transactions, spark_balances RESTART IDENTITY CASCADE',
    );
  });

  const server = () => app.getHttpServer();

  describe('GET /spark/balance', () => {
    it('인증된 사용자의 잔액을 반환한다 (200) — 이력 없으면 0', async () => {
      const res = await request(server())
        .get('/spark/balance')
        .set('Authorization', `Bearer ${memberToken()}`)
        .expect(200);
      const body = res.body.data ?? res.body;
      expect(body).toHaveProperty('balance');
      expect(body.balance).toBe(0);
    });
    it('토큰 누락 시 401', async () => {
      const res = await request(server()).get('/spark/balance').expect(401);
      expect(res.body.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /spark/login-daily', () => {
    it('하루 첫 로그인 보상 지급 성공', async () => {
      const res = await request(server())
        .post('/spark/login-daily')
        .set('Authorization', `Bearer ${memberToken()}`)
        .expect((r) => expect([200, 201]).toContain(r.status));
      const body = res.body.data ?? res.body;
      expect(body).toMatchObject({ reason: 'LOGIN_DAILY' });
    });
    it('같은 날 중복 호출 시 409', async () => {
      await request(server())
        .post('/spark/login-daily')
        .set('Authorization', `Bearer ${memberToken()}`)
        .expect((r) => expect([200, 201]).toContain(r.status));
      await request(server())
        .post('/spark/login-daily')
        .set('Authorization', `Bearer ${memberToken()}`)
        .expect(409);
    });
  });
});
