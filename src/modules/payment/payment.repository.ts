import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { PaymentEntity } from './entities/payment.entity';

// 화이트리스트: 정렬 허용 컬럼 (임의 입력 차단). 값은 엔티티 프로퍼티명.
const SORTABLE: Record<string, string> = {
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  amount: 'amount',
  status: 'status',
};

@Injectable()
export class PaymentRepository {
  constructor(private readonly dataSource: DataSource) {}

  private repo(manager?: EntityManager): Repository<PaymentEntity> {
    return manager
      ? manager.getRepository(PaymentEntity)
      : this.dataSource.getRepository(PaymentEntity);
  }

  create(data: Partial<PaymentEntity>): PaymentEntity {
    return this.repo().create(data);
  }

  save(entity: PaymentEntity, manager?: EntityManager): Promise<PaymentEntity> {
    return this.repo(manager).save(entity);
  }

  findById(id: string, manager?: EntityManager): Promise<PaymentEntity | null> {
    return this.repo(manager).findOne({ where: { id } });
  }

  async findAndCountByUser(
    userId: string,
    page: number,
    limit: number,
    sort?: string,
  ): Promise<[PaymentEntity[], number]> {
    let column = 'createdAt';
    let direction: 'ASC' | 'DESC' = 'DESC';
    if (sort) {
      const [field, dir] = sort.split(':');
      if (SORTABLE[field]) column = SORTABLE[field];
      if (dir && dir.toLowerCase() === 'asc') direction = 'ASC';
    }
    return this.repo()
      .createQueryBuilder('p')
      .where('p.userId = :userId', { userId })
      .orderBy(`p.${column}`, direction)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
  }
}
