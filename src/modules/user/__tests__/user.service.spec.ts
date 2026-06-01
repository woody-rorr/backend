import { NotFoundException } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserService } from '../user.service';
import { UserEntity } from '../entities/user.entity';
import { createTestingModule, truncateUsers } from '../../../../test/setup';

describe('UserService (real DB)', () => {
  let moduleRef: TestingModule;
  let service: UserService;
  let repo: Repository<UserEntity>;
  let dataSource: DataSource;

  beforeAll(async () => {
    moduleRef = await createTestingModule();
    service = moduleRef.get(UserService);
    repo = moduleRef.get(getRepositoryToken(UserEntity));
    dataSource = moduleRef.get(getDataSourceToken());
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  beforeEach(async () => {
    await truncateUsers(dataSource);
  });

  describe('getUserById', () => {
    it('returns the user when it exists', async () => {
      const saved = await repo.save(
        repo.create({ name: 'Woody', email: 'woody@rorr.club', image: 'https://img/u.png' }),
      );

      const found = await service.getUserById(saved.id);

      expect(found).toMatchObject({
        id: saved.id,
        name: 'Woody',
        email: 'woody@rorr.club',
        image: 'https://img/u.png',
      });
    });

    it('throws NotFoundException for an unknown id', async () => {
      await expect(
        service.getUserById('00000000-0000-0000-0000-000000000000'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
