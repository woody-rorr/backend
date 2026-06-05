import { Injectable, NotFoundException } from '@nestjs/common';
import { BoardRepository } from './board.repository';
import { Board } from './entities/board.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import {
  BoardListResponseDto,
  BoardResponseDto,
  ListBoardsQueryDto,
} from './dto/board-response.dto';

const SORTABLE_FIELDS = ['id', 'title', 'createdAt', 'updatedAt'];

@Injectable()
export class BoardService {
  constructor(private readonly boardRepository: BoardRepository) {}

  async create(dto: CreateBoardDto): Promise<BoardResponseDto> {
    const board = this.boardRepository.create(dto);
    const saved = await this.boardRepository.save(board);
    return this.toResponse(saved);
  }

  async findAll(query: ListBoardsQueryDto): Promise<BoardListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const order = this.resolveOrder(query.sort);
    const [items, total] = await this.boardRepository.findAndCount({
      order,
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data: items.map((b) => this.toResponse(b)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<BoardResponseDto> {
    return this.toResponse(await this.loadOrThrow(id));
  }

  async update(id: string, dto: UpdateBoardDto): Promise<BoardResponseDto> {
    const board = await this.loadOrThrow(id);
    Object.assign(board, dto);
    const saved = await this.boardRepository.save(board);
    return this.toResponse(saved);
  }

  async remove(id: string): Promise<void> {
    const board = await this.loadOrThrow(id);
    await this.boardRepository.remove(board);
  }

  private async loadOrThrow(id: string): Promise<Board> {
    const board = await this.boardRepository.findById(id);
    if (!board) {
      throw new NotFoundException({
        code: 'BOARD_NOT_FOUND',
        message: '게시글을 찾을 수 없습니다',
      });
    }
    return board;
  }

  private resolveOrder(sort?: string): Record<string, 'ASC' | 'DESC'> {
    const [rawField, rawDir] = (sort ?? 'createdAt:desc').split(':');
    const field = SORTABLE_FIELDS.includes(rawField) ? rawField : 'createdAt';
    const direction = (rawDir ?? '').toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    return { [field]: direction };
  }

  private toResponse(board: Board): BoardResponseDto {
    return {
      id: board.id,
      title: board.title,
      content: board.content,
      author: board.author,
      createdAt: board.createdAt.toISOString(),
      updatedAt: board.updatedAt.toISOString(),
    };
  }
}
