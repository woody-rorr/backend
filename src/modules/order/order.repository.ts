import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { OrderEntity } from './entities/order.entity';

export interface FindManyOptions {
  userId: string;
  status?: string;
  page: number;
  limit: number;
  sortField: string;
  sortDir: 'ASC' | 'DESC';
}

/** ORM access only. No business rules live here. */
@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly repo: Repository<OrderEntity>,
  ) {}

  create(data: Partial<OrderEntity>): OrderEntity {
    return this.repo.create(data);
  }

  save(order: OrderEntity, manager?: EntityManager): Promise<OrderEntity> {
    const r = manager ? manager.getRepository(OrderEntity) : this.repo;
    return r.save(order);
  }

  findById(id: string, userId: string): Promise<OrderEntity | null> {
    return this.repo.findOne({ where: { id, userId } });
  }

  findMany(opts: FindManyOptions): Promise<[OrderEntity[], number]> {
    const where: Record<string, unknown> = { userId: opts.userId };
    if (opts.status) where.status = opts.status;
    return this.repo.findAndCount({
      where,
      order: { [opts.sortField]: opts.sortDir },
      skip: (opts.page - 1) * opts.limit,
      take: opts.limit,
    });
  }

  softDelete(order: OrderEntity): Promise<OrderEntity> {
    return this.repo.softRemove(order);
  }

  countSince(userId: string, since: Date): Promise<number> {
    return this.repo
      .createQueryBuilder('o')
      .where('o.user_id = :userId', { userId })
      .andWhere('o.created_at >= :since', { since })
      .getCount();
  }
}
