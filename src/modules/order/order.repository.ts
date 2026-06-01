import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { OrderEntity } from './entities/order.entity';

@Injectable()
export class OrderRepository extends Repository<OrderEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(OrderEntity, dataSource.createEntityManager());
  }

  async findByIdOrNull(id: string): Promise<OrderEntity | null> {
    return this.findOne({ where: { id } });
  }

  async findAndPaginate(params: {
    page: number;
    limit: number;
    userId?: string;
    sortField: string;
    sortDir: 'ASC' | 'DESC';
  }): Promise<[OrderEntity[], number]> {
    const { page, limit, userId, sortField, sortDir } = params;
    const qb = this.createQueryBuilder('order');
    if (userId) {
      qb.where('order.userId = :userId', { userId });
    }
    qb.orderBy(`order.${sortField}`, sortDir)
      .skip((page - 1) * limit)
      .take(limit);
    return qb.getManyAndCount();
  }
}
