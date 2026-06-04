import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  create(data: Partial<UserEntity>): UserEntity {
    return this.repo.create(data);
  }

  save(entity: UserEntity): Promise<UserEntity> {
    return this.repo.save(entity);
  }

  findById(id: string): Promise<UserEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<UserEntity | null> {
    return this.repo.findOne({ where: { email } });
  }

  async deleteById(id: string): Promise<void> {
    await this.repo.delete({ id });
  }
}
