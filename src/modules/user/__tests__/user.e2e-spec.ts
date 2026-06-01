import { INestApplication } from '@nestjs/common';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import request from 'supertest';
import { UserEntity } from '../entities/user.entity';
import { createTestApp, truncateUsers } from '../../../../test/setup';

describe('UserController (e2e) GET /users/:id', () => {
  let app: INestApplication;
  let repo: Repository<UserEntity>;
  let dataSource: DataSource;

  beforeAll(async () => {
    app = await createTestApp();
    repo = app.get(getRepositoryToken(UserEntity));
    dataSource = app.get(getDataSourceToken());
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await truncateUsers(dataSource);
  });

  it('returns 200 with the user payload', async () => {
    const saved = await repo.save(
      repo.create({ name: 'Woody', email: 'woody@rorr.club', image: 'https://img/u.png' }),
    );

    const res = await request(app.getHttpServer()).get(`/users/${saved.id}`).expect(200);

    const body = res.body.data ?? res.body;
    expect(body).toMatchObject({
      id: saved.id,
      name: 'Woody',
      email: 'woody@rorr.club',
      image: 'https://img/u.png',
    });
  });

  it('returns 404 RESOURCE_NOT_FOUND for an unknown id', async () => {
    await request(app.getHttpServer())
      .get('/users/00000000-0000-0000-0000-000000000000')
      .expect(404)
      .expect(({ body }) => expect(body.code).toBe('RESOURCE_NOT_FOUND'));
  });

  it('returns 400 VALIDATION_ERROR for a malformed uuid', async () => {
    await request(app.getHttpServer())
      .get('/users/not-a-uuid')
      .expect(400)
      .expect(({ body }) => expect(body.code).toBe('VALIDATION_ERROR'));
  });
});
