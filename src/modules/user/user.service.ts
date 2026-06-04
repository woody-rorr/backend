import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './user.repository';

const SALT_ROUNDS = 10;

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException({
        code: 'EMAIL_EXISTS',
        message: '이미 등록된 이메일입니다',
      });
    }
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const entity = this.userRepository.create({
      email: dto.email,
      passwordHash,
      username: dto.username ?? null,
    });
    const saved = await this.userRepository.save(entity);
    return this.toResponse(saved);
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.getOrThrow(id);
    return this.toResponse(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.getOrThrow(id);

    if (dto.email && dto.email !== user.email) {
      const dup = await this.userRepository.findByEmail(dto.email);
      if (dup) {
        throw new ConflictException({
          code: 'EMAIL_EXISTS',
          message: '이미 등록된 이메일입니다',
        });
      }
      user.email = dto.email;
    }
    if (dto.username !== undefined) {
      user.username = dto.username ?? null;
    }
    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    }

    const saved = await this.userRepository.save(user);
    return this.toResponse(saved);
  }

  async remove(id: string): Promise<void> {
    await this.getOrThrow(id);
    await this.userRepository.deleteById(id);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findByEmail(email);
  }

  private async getOrThrow(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: '사용자를 찾을 수 없습니다',
      });
    }
    return user;
  }

  private toResponse(user: UserEntity): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
