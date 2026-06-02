import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm';
import { ProductEntity } from './entities/product.entity';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repo: Repository<ProductEntity>,
  ) {}

  create(data: Partial<ProductEntity>): ProductEntity {
    return this.repo.create(data);
  }

  save(entity: ProductEntity): Promise<ProductEntity> {
    return this.repo.save(entity);
  }

  findById(id: string): Promise<ProductEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  findAndCount(opts: {
    where: FindOptionsWhere<ProductEntity>;
    skip: number;
    take: number;
    order: FindOptionsOrder<ProductEntity>;
  }): Promise<[ProductEntity[], number]> {
    return this.repo.findAndCount({
      where: opts.where,
      skip: opts.skip,
      take: opts.take,
      order: opts.order,
    });
  }

  async remove(entity: ProductEntity): Promise<void> {
    await this.repo.remove(entity);
  }
}
