import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginationDto } from './dto/pagination.dto';
import { PostResponseDto } from './dto/post-response.dto';
import { Post } from './entities/post.entity';

export interface PaginatedPostsResult {
  data: PostResponseDto[];
  meta: { page: number; limit: number; total: number; totalPages: number; };
}

@Injectable()
export class PostsService {
  constructor(private readonly postsRepository: PostsRepository) {}

  async create(input: { authorId: string; title: string; content: string }): Promise<PostResponseDto> {
    const post = await this.postsRepository.create(input);
    return PostResponseDto.fromEntity(post);
  }

  async findById(id: string): Promise<PostResponseDto> {
    const post = await this.getOrThrow(id);
    return PostResponseDto.fromEntity(post);
  }

  async list(query: PaginationDto): Promise<PaginatedPostsResult> {
    const { page, limit, sort } = query;
    const [posts, total] = await this.postsRepository.findManyPaginated({ page, limit, sort });
    return {
      data: posts.map((post) => PostResponseDto.fromEntity(post)),
      meta: { page, limit, total, totalPages: total === 0 ? 0 : Math.ceil(total / limit) },
    };
  }

  async update(id: string, authorId: string, dto: UpdatePostDto): Promise<PostResponseDto> {
    const post = await this.getOrThrow(id);
    this.assertOwner(post, authorId);
    const updated = await this.postsRepository.update(id, dto);
    return PostResponseDto.fromEntity(updated);
  }

  async softDelete(id: string, authorId: string): Promise<void> {
    const post = await this.getOrThrow(id);
    this.assertOwner(post, authorId);
    await this.postsRepository.softDelete(id);
  }

  private async getOrThrow(id: string): Promise<Post> {
    const post = await this.postsRepository.findById(id);
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  private assertOwner(post: Post, authorId: string): void {
    if (post.authorId !== authorId) throw new ForbiddenException('Only the author can modify this post');
  }
}
