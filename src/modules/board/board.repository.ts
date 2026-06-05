import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Board } from './entities/board.entity';

@Injectable()
export class BoardRepository {
  constructor(
    @InjectRepository(Board)
    private readonly repo: Repository<Board>,
  ) {}

  create(data: Partial<Board>): Board {
    return this.repo.create(data);
  }

  save(board: Board): Promise<Board> {
    return this.repo.save(board);
  }

  findById(id: string): Promise<Board | null> {
    return this.repo.findOne({ where: { id } });
  }

  findAndCount(options: FindManyOptions<Board>): Promise<[Board[], number]> {
    return this.repo.findAndCount(options);
  }

  async remove(board: Board): Promise<void> {
    await this.repo.remove(board);
  }
}
