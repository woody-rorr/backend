import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { OrderRepository } from './order.repository';

const SORTABLE_FIELDS = ['createdAt', 'updatedAt', 'price', 'quantity', 'status'];

@Injectable()
export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async create(dto: CreateOrderDto): Promise<OrderResponseDto> {
    const order = this.orderRepository.create({
      userId: dto.userId,
      productName: dto.productName,
      quantity: dto.quantity,
      price: dto.price,
    });
    const saved = await this.orderRepository.save(order);
    return OrderResponseDto.fromEntity(saved);
  }

  async findAll(query: ListOrdersQueryDto): Promise<{
    data: OrderResponseDto[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { field, dir } = this.parseSort(query.sort);
    const [rows, total] = await this.orderRepository.findAndPaginate({
      page,
      limit,
      userId: query.userId,
      sortField: field,
      sortDir: dir,
    });
    return {
      data: rows.map((r) => OrderResponseDto.fromEntity(r)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findByIdOrNull(id);
    if (!order) {
      throw new NotFoundException({ code: 'RESOURCE_NOT_FOUND', message: '주문을 찾을 수 없습니다' });
    }
    return OrderResponseDto.fromEntity(order);
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findByIdOrNull(id);
    if (!order) {
      throw new NotFoundException({ code: 'RESOURCE_NOT_FOUND', message: '주문을 찾을 수 없습니다' });
    }
    order.changeStatus(dto.status);
    const saved = await this.orderRepository.save(order);
    return OrderResponseDto.fromEntity(saved);
  }

  async remove(id: string): Promise<void> {
    const order = await this.orderRepository.findByIdOrNull(id);
    if (!order) {
      throw new NotFoundException({ code: 'RESOURCE_NOT_FOUND', message: '주문을 찾을 수 없습니다' });
    }
    await this.orderRepository.delete(id);
  }

  private parseSort(sort?: string): { field: string; dir: 'ASC' | 'DESC' } {
    if (!sort) return { field: 'createdAt', dir: 'DESC' };
    const [field, dirRaw] = sort.split(':');
    const safeField = SORTABLE_FIELDS.includes(field) ? field : 'createdAt';
    const dir = (dirRaw ?? 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    return { field: safeField, dir };
  }
}
