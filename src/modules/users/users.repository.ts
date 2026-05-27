import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

export interface CreateUserInput { email: string; passwordHash: string; name: string; }

@Injectable()
export class UsersRepository {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}
  findByEmail(email: string): Promise<User | null> { return this.repo.findOne({ where: { email } }); }
  findById(id: string): Promise<User | null> { return this.repo.findOne({ where: { id } }); }
  async create(input: CreateUserInput): Promise<User> {
    const user = this.repo.create(input);
    return this.repo.save(user);
  }
}
