import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizEntity } from './entities/quiz.entity';

@Injectable()
export class QuizRepository {
  constructor(
    @InjectRepository(QuizEntity)
    private readonly repo: Repository<QuizEntity>,
  ) {}

  create(data: Partial<QuizEntity>): QuizEntity {
    return this.repo.create(data);
  }

  save(entity: QuizEntity): Promise<QuizEntity> {
    return this.repo.save(entity);
  }

  findById(id: number): Promise<QuizEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  findAndCount(page: number, limit: number): Promise<[QuizEntity[], number]> {
    return this.repo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async deleteById(id: number): Promise<void> {
    await this.repo.delete({ id });
  }
}
