import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createTestApp, resetDatabase } from '../../../../test/setup';

/**
 * e2e suite for the payment module.
 *
 * Cases (from spec):
 *  - POST   /payments              201 created
 *  - GET    /payments/:id          200 fetch ok
 *  - GET    /payments/:id          404 missing payment
 *  - GET    /payments/:id          403 other user's payment
 *  - POST   /payments/:id/cancel   200 cancel ok
 *  - POST   /payments/:id/cancel   422 already cancelled
 *  - POST   /payments/:id/confirm  200 confirm ok
 *  - POST   /payments/:id/confirm  409 duplicate transaction id
 *  - POST   /payments/:id/confirm  422 already completed
 *
 * Error codes follow 06-runtime-rules.md §4:
 *  404 -> RESOURCE_NOT_FOUND, 403 -> FORBIDDEN,
 *  409 -> CONFLICT, 422 -> BUSINESS_RULE_VIOLATION.
 */
describe('PaymentController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  // Auth tokens for two distinct owners (ownership / 403 coverage).
  let ownerToken: string;
  let otherToken: string;

  const validPaymentBody = () => ({
    amount: '10000.00',
    currency: 'KRW',
    method: 'card',
  });

  async function signupAndToken(email: string): Promise<string> {
    const res = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({ email, password: 'Passw0rd!', name: email.split('@')[0] })
      .expect(201);
    return res.body.accessToken as string;
  }

  async function createPayment(token: string) {
    return request(app.getHttpServer())
      .post('/payments')
      .set('Authorization', `Bearer ${token}`)
      .send(validPaymentBody());
  }

  beforeAll(async () => {
    const ctx = await createTestApp();
    app = ctx.app;
    dataSource = ctx.dataSource;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await resetDatabase(dataSource);
    ownerToken = await signupAndToken('owner@e.com');
    otherToken = await signupAndToken('other@e.com');
  });

  describe('POST /payments', () => {
    it('creates a payment and returns 201', async () => {
      const res = await createPayment(ownerToken).expect(201);
      expect(res.body).toMatchObject({
        id: expect.any(String),
        amount: expect.any(String),
        currency: 'KRW',
        status: expect.any(String),
      });
    });

    it('rejects unauthenticated requests with 401', async () => {
      await request(app.getHttpServer())
        .post('/payments')
        .send(validPaymentBody())
        .expect(401);
    });

    it('rejects invalid body with 400', async () => {
      await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ currency: 'KRW' })
        .expect(400)
        .expect(({ body }) => expect(body.code).toBe('VALIDATION_ERROR'));
    });
  });

  describe('GET /payments/:id', () => {
    it('returns 200 with the payment for its owner', async () => {
      const created = await createPayment(ownerToken).expect(201);
      const res = await request(app.getHttpServer())
        .get(`/payments/${created.body.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);
      expect(res.body.id).toBe(created.body.id);
    });

    it('returns 404 for a non-existent payment', async () => {
      await request(app.getHttpServer())
        .get('/payments/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(404)
        .expect(({ body }) => expect(body.code).toBe('RESOURCE_NOT_FOUND'));
    });

    it("returns 403 when fetching another user's payment", async () => {
      const created = await createPayment(ownerToken).expect(201);
      await request(app.getHttpServer())
        .get(`/payments/${created.body.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403)
        .expect(({ body }) => expect(body.code).toBe('FORBIDDEN'));
    });
  });

  describe('POST /payments/:id/cancel', () => {
    it('cancels a payment and returns 200', async () => {
      const created = await createPayment(ownerToken).expect(201);
      const res = await request(app.getHttpServer())
        .post(`/payments/${created.body.id}/cancel`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);
      expect(res.body.status).toBe('cancelled');
    });

    it('returns 422 when cancelling an already-cancelled payment', async () => {
      const created = await createPayment(ownerToken).expect(201);
      await request(app.getHttpServer())
        .post(`/payments/${created.body.id}/cancel`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);
      await request(app.getHttpServer())
        .post(`/payments/${created.body.id}/cancel`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(422)
        .expect(({ body }) =>
          expect(body.code).toBe('BUSINESS_RULE_VIOLATION'),
        );
    });
  });

  describe('POST /payments/:id/confirm', () => {
    it('confirms a payment and returns 200', async () => {
      const created = await createPayment(ownerToken).expect(201);
      const res = await request(app.getHttpServer())
        .post(`/payments/${created.body.id}/confirm`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ transactionId: 'txn-confirm-ok-1' })
        .expect(200);
      expect(res.body.status).toBe('completed');
    });

    it('returns 409 when the transaction id is already used', async () => {
      const first = await createPayment(ownerToken).expect(201);
      await request(app.getHttpServer())
        .post(`/payments/${first.body.id}/confirm`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ transactionId: 'txn-dup-1' })
        .expect(200);

      const second = await createPayment(ownerToken).expect(201);
      await request(app.getHttpServer())
        .post(`/payments/${second.body.id}/confirm`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ transactionId: 'txn-dup-1' })
        .expect(409)
        .expect(({ body }) => expect(body.code).toBe('CONFLICT'));
    });

    it('returns 422 when confirming an already-completed payment', async () => {
      const created = await createPayment(ownerToken).expect(201);
      await request(app.getHttpServer())
        .post(`/payments/${created.body.id}/confirm`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ transactionId: 'txn-complete-1' })
        .expect(200);
      await request(app.getHttpServer())
        .post(`/payments/${created.body.id}/confirm`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ transactionId: 'txn-complete-2' })
        .expect(422)
        .expect(({ body }) =>
          expect(body.code).toBe('BUSINESS_RULE_VIOLATION'),
        );
    });
  });
});
