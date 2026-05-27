import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserInput, UsersRepository } from './users.repository';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}
  findByEmail(email: string): Promise<User | null> { return this.usersRepository.findByEmail(email); }
  findById(id: string): Promise<User | null> { return this.usersRepository.findById(id); }
  async createUser(input: CreateUserInput): Promise<User> {
    const existing = await this.usersRepository.findByEmail(input.email);
    if (existing) throw new ConflictException({ code: 'EMAIL_EXISTS', message: 'Email already in use' });
    return this.usersRepository.create(input);
  }
}
