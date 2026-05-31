import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm';
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

  async save(entity: QuizEntity): Promise<QuizEntity> {
    return this.repo.save(entity);
  }

  async findById(id: string): Promise<QuizEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findAndCount(params: {
    where: FindOptionsWhere<QuizEntity>;
    order: FindOptionsOrder<QuizEntity>;
    skip: number;
    take: number;
  }): Promise<[QuizEntity[], number]> {
    return this.repo.findAndCount({
      where: params.where,
      order: params.order,
      skip: params.skip,
      take: params.take,
    });
  }

  async deleteById(id: string): Promise<number> {
    const result = await this.repo.delete({ id });
    return result.affected ?? 0;
  }
}
