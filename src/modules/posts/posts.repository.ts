import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';

export interface FindManyPaginatedOptions { page: number; limit: number; sort?: string; }

const SORTABLE_FIELDS = ['createdAt', 'updatedAt', 'title'];

@Injectable()
export class PostsRepository {
  constructor(@InjectRepository(Post) private readonly repository: Repository<Post>) {}

  async findById(id: string): Promise<Post | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findManyPaginated({ page, limit, sort }: FindManyPaginatedOptions): Promise<[Post[], number]> {
    const { field, direction } = this.parseSort(sort);
    return this.repository.findAndCount({
      order: { [field]: direction },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async create(data: { authorId: string; title: string; content: string; }): Promise<Post> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(id: string, data: Partial<Pick<Post, 'title' | 'content'>>): Promise<Post> {
    await this.repository.update(id, data);
    return this.repository.findOneByOrFail({ id });
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  private parseSort(sort?: string): { field: string; direction: 'ASC' | 'DESC' } {
    const [rawField, rawDirection] = (sort ?? 'createdAt:desc').split(':');
    const field = SORTABLE_FIELDS.includes(rawField) ? rawField : 'createdAt';
    const direction = rawDirection?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    return { field, direction };
  }
}
