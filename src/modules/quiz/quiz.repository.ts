import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryQuizDto, RandomQuizDto } from './dto/query-quiz.dto';
import { Quiz } from './entities/quiz.entity';

@Injectable()
export class QuizRepository {
  constructor(
    @InjectRepository(Quiz)
    private readonly repo: Repository<Quiz>,
  ) {}

  async findById(id: number): Promise<Quiz | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findMany(query: QueryQuizDto): Promise<Quiz[]> {
    const qb = this.repo.createQueryBuilder('quiz');
    if (query.category) {
      qb.andWhere('quiz.category = :category', { category: query.category });
    }
    if (query.difficulty) {
      qb.andWhere('quiz.difficulty = :difficulty', { difficulty: query.difficulty });
    }
    qb.orderBy('quiz.created_at', 'DESC').limit(query.limit ?? 20);
    return qb.getMany();
  }

  async findRandom(query: RandomQuizDto): Promise<Quiz | null> {
    const qb = this.repo.createQueryBuilder('quiz');
    if (query.category) {
      qb.andWhere('quiz.category = :category', { category: query.category });
    }
    if (query.difficulty) {
      qb.andWhere('quiz.difficulty = :difficulty', { difficulty: query.difficulty });
    }
    qb.orderBy('RANDOM()').limit(1);
    return qb.getOne();
  }

  async deleteById(id: number): Promise<void> {
    await this.repo.delete({ id });
  }
}
