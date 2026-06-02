import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BlogRepository } from './blog.repository';
import { CreateBlogDto } from './dto/create-blog.dto';
import { QueryBlogDto } from './dto/query-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Blog } from './entities/blog.entity';

@Injectable()
export class BlogService {
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateBlogDto): Promise<Blog> {
    const blog = this.blogRepository.create({
      title: dto.title,
      content: dto.content,
      author: dto.author,
      category: dto.category ?? null,
      tags: dto.tags ?? [],
      published: dto.published ?? false,
      viewCount: 0,
    });
    return this.blogRepository.save(blog);
  }

  async findAll(query: QueryBlogDto): Promise<{ items: Blog[]; total: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [items, total] = await this.blogRepository.findAndCount({
      page,
      limit,
      category: query.category,
      published: query.published,
    });
    return { items, total };
  }

  private async getOrThrow(id: string): Promise<Blog> {
    const blog = await this.blogRepository.findById(id);
    if (!blog) {
      throw new NotFoundException({
        code: 'BLOG_NOT_FOUND',
        message: '블로그를 찾을 수 없습니다',
      });
    }
    return blog;
  }

  // GET /blogs/:id — 상세 조회 시 조회수 증가 (명세 그대로)
  async findOne(id: string): Promise<Blog> {
    return this.dataSource.transaction(async () => {
      const blog = await this.getOrThrow(id);
      blog.incrementView();
      return this.blogRepository.save(blog);
    });
  }

  async update(id: string, dto: UpdateBlogDto): Promise<Blog> {
    const blog = await this.getOrThrow(id);
    if (dto.title !== undefined) blog.title = dto.title;
    if (dto.content !== undefined) blog.content = dto.content;
    if (dto.category !== undefined) blog.category = dto.category ?? null;
    if (dto.tags !== undefined) blog.tags = dto.tags;
    if (dto.published !== undefined) blog.published = dto.published;
    return this.blogRepository.save(blog);
  }

  async remove(id: string): Promise<boolean> {
    await this.getOrThrow(id);
    return this.blogRepository.deleteById(id);
  }

  // POST /blogs/:id/view — 조회수 증가
  async incrementView(id: string): Promise<number> {
    return this.dataSource.transaction(async () => {
      const blog = await this.getOrThrow(id);
      blog.incrementView();
      const saved = await this.blogRepository.save(blog);
      return saved.viewCount;
    });
  }
}
