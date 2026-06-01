import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderEntity } from './entities/order.entity';
import { OrderRepository } from './order.repository';

/** creative rule: abuse guard — cap orders created per user per UTC day */
const DAILY_ORDER_LIMIT = 50;

@Injectable()
export class OrderService {
  constructor(
    private readonly orders: OrderRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: string, dto: CreateOrderDto): Promise<OrderResponseDto> {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const todays = await this.orders.countSince(userId, startOfDay);
    if (todays >= DAILY_ORDER_LIMIT) {
      throw new HttpException(
        {
          code: 'ORDER_DAILY_LIMIT_EXCEEDED',
          message: `하루 주문 한도(${DAILY_ORDER_LIMIT}건)를 초과했습니다`,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const saved = await this.dataSource.transaction(async (mgr) => {
      const order = this.orders.create({
        userId,
        orderNumber: this.generateOrderNumber(),
        status: 'pending',
        items: dto.items,
        currency: dto.currency ?? 'USD',
        shippingAddress: dto.shippingAddress,
        notes: dto.notes ?? null,
      });
      order.recalculateTotal();
      return this.orders.save(order, mgr);
    });

    return OrderResponseDto.from(saved);
  }

  async findOne(userId: string, id: string): Promise<OrderResponseDto> {
    return OrderResponseDto.from(await this.loadOwned(userId, id));
  }

  async findAll(userId: string, query: ListOrdersQueryDto) {
    const [field, dir] = query.sort.split(':');
    const [rows, total] = await this.orders.findMany({
      userId,
      status: query.status,
      page: query.page,
      limit: query.limit,
      sortField: field,
      sortDir: dir.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
    });
    return {
      data: rows.map((r) => OrderResponseDto.from(r)),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async update(userId: string, id: string, dto: UpdateOrderDto): Promise<OrderResponseDto> {
    const order = await this.loadOwned(userId, id);
    order.updateDetails({ shippingAddress: dto.shippingAddress, notes: dto.notes });
    return OrderResponseDto.from(await this.orders.save(order));
  }

  async pay(userId: string, id: string): Promise<OrderResponseDto> {
    const order = await this.loadOwned(userId, id);
    order.pay();
    return OrderResponseDto.from(await this.orders.save(order));
  }

  async cancel(userId: string, id: string): Promise<OrderResponseDto> {
    const order = await this.loadOwned(userId, id);
    order.cancel();
    return OrderResponseDto.from(await this.orders.save(order));
  }

  async remove(userId: string, id: string): Promise<void> {
    const order = await this.loadOwned(userId, id);
    if (order.status !== 'cancelled') {
      throw new HttpException(
        { code: 'INVALID_ORDER_STATE', message: '취소된 주문만 삭제할 수 있습니다' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    await this.orders.softDelete(order);
  }

  /** ownership is enforced by the userId filter — returns 404 (not 403) to avoid leaking existence */
  private async loadOwned(userId: string, id: string): Promise<OrderEntity> {
    const order = await this.orders.findById(id, userId);
    if (!order) {
      throw new NotFoundException({ code: 'ORDER_NOT_FOUND', message: '주문을 찾을 수 없습니다' });
    }
    return order;
  }

  private generateOrderNumber(): string {
    const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `ORD-${ymd}-${rand}`;
  }
}
