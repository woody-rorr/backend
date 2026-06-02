import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';

@Injectable()
export class BlogRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly repo: Repository<Blog>,
  ) {}

  create(data: Partial<Blog>): Blog {
    return this.repo.create(data);
  }

  save(blog: Blog): Promise<Blog> {
    return this.repo.save(blog);
  }

  findById(id: string): Promise<Blog | null> {
    return this.repo.findOne({ where: { id } });
  }

  findAndCount(params: {
    page: number;
    limit: number;
    category?: string;
    published?: boolean;
  }): Promise<[Blog[], number]> {
    const where: FindOptionsWhere<Blog> = {};
    if (params.category !== undefined) where.category = params.category;
    if (params.published !== undefined) where.published = params.published;
    return this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    });
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.repo.delete({ id });
    return (result.affected ?? 0) > 0;
  }
}
