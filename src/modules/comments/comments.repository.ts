import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly repo: Repository<Comment>,
  ) {}

  create(data: Partial<Comment>): Comment {
    return this.repo.create(data);
  }

  save(comment: Comment): Promise<Comment> {
    return this.repo.save(comment);
  }

  findById(id: string): Promise<Comment | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByPostId(postId: string): Promise<Comment[]> {
    return this.repo.find({
      where: { postId },
      order: { createdAt: 'ASC' },
    });
  }

  async remove(comment: Comment): Promise<void> {
    await this.repo.remove(comment);
  }
}
