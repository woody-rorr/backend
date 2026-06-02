import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProductRepository } from './product.repository';
import { ProductEntity } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { ListProductQueryDto } from './dto/list-product.dto';

function toProductResponse(p: ProductEntity) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price === null || p.price === undefined ? null : Number(p.price),
    stock: p.stock,
    category: p.category,
    imageUrl: p.imageUrl,
    isActive: p.isActive,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
  };
}

function notFound(): never {
  throw new NotFoundException({ code: 'PRODUCT_NOT_FOUND', message: '상품을 찾을 수 없습니다' });
}

@Injectable()
export class ProductService {
  constructor(
    private readonly products: ProductRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateProductDto) {
    const entity = this.products.create({
      name: dto.name,
      description: dto.description ?? null,
      price: String(dto.price),
      stock: dto.stock ?? 0,
      category: dto.category ?? null,
      imageUrl: dto.imageUrl ?? null,
      isActive: dto.isActive ?? true,
    });
    return toProductResponse(await this.products.save(entity));
  }

  async findAll(query: ListProductQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Record<string, unknown> = {};
    if (query.category !== undefined) where.category = query.category;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    const [rows, total] = await this.products.findAndCount({
      where: where as any,
      skip: (page - 1) * limit,
      take: limit,
      order: this.parseSort(query.sort) as any,
    });
    return {
      data: rows.map(toProductResponse),
      meta: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const entity = await this.products.findById(id);
    if (!entity) notFound();
    return toProductResponse(entity!);
  }

  async update(id: string, dto: UpdateProductDto) {
    const entity = await this.products.findById(id);
    if (!entity) notFound();
    if (dto.name !== undefined) entity!.name = dto.name;
    if (dto.description !== undefined) entity!.description = dto.description ?? null;
    if (dto.price !== undefined) entity!.price = String(dto.price);
    if (dto.stock !== undefined) entity!.stock = dto.stock;
    if (dto.category !== undefined) entity!.category = dto.category ?? null;
    if (dto.imageUrl !== undefined) entity!.imageUrl = dto.imageUrl ?? null;
    if (dto.isActive !== undefined) entity!.isActive = dto.isActive;
    return toProductResponse(await this.products.save(entity!));
  }

  async remove(id: string): Promise<void> {
    const entity = await this.products.findById(id);
    if (!entity) notFound();
    await this.products.remove(entity!);
  }

  async adjustStock(id: string, dto: AdjustStockDto) {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(ProductEntity);
      const entity = await repo.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!entity) notFound();
      entity!.adjustStock(dto.quantity); // 불변식 검증은 엔티티 안에서
      return toProductResponse(await repo.save(entity!));
    });
  }

  private parseSort(sort?: string): Record<string, 'ASC' | 'DESC'> {
    if (!sort) return { createdAt: 'DESC' };
    const [field, dir] = sort.split(':');
    const allowed = ['createdAt', 'updatedAt', 'price', 'name', 'stock'];
    if (!allowed.includes(field)) return { createdAt: 'DESC' };
    return { [field]: (dir || 'asc').toLowerCase() === 'desc' ? 'DESC' : 'ASC' };
  }
}
