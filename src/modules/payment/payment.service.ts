import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PaymentRepository } from './payment.repository';
import { PaymentEntity } from './entities/payment.entity';
import { ConfirmPaymentDto, CreatePaymentDto } from './dto/create-payment.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';

@Injectable()
export class PaymentService {
  constructor(
    private readonly payments: PaymentRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: string, dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    const saved = await this.dataSource.transaction(async (mgr) => {
      const entity = this.payments.create({
        userId,
        amount: dto.amount.toFixed(2),
        currency: dto.currency ?? 'KRW',
        method: dto.method,
        status: 'pending',
        metadata: dto.metadata ?? null,
        transactionId: null,
      });
      return this.payments.save(entity, mgr);
    });
    return PaymentResponseDto.fromEntity(saved);
  }

  async findOne(userId: string, id: string): Promise<PaymentResponseDto> {
    const payment = await this.payments.findById(id);
    if (!payment) throw this.notFound();
    this.assertOwner(userId, payment);
    return PaymentResponseDto.fromEntity(payment);
  }

  async list(userId: string, query: QueryPaymentDto) {
    const [rows, total] = await this.payments.findAndCountByUser(
      userId,
      query.page,
      query.limit,
      query.sort,
    );
    return {
      data: rows.map((r) => PaymentResponseDto.fromEntity(r)),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async cancel(userId: string, id: string): Promise<PaymentResponseDto> {
    const saved = await this.dataSource.transaction(async (mgr) => {
      const payment = await this.payments.findById(id, mgr);
      if (!payment) throw this.notFound();
      this.assertOwner(userId, payment);
      payment.cancel();
      return this.payments.save(payment, mgr);
    });
    return PaymentResponseDto.fromEntity(saved);
  }

  // PG 콜백 승인 — 인증된 사용자 컨텍스트 없음 (소유권 체크 생략).
  async confirm(id: string, dto: ConfirmPaymentDto): Promise<PaymentResponseDto> {
    try {
      const saved = await this.dataSource.transaction(async (mgr) => {
        const payment = await this.payments.findById(id, mgr);
        if (!payment) throw this.notFound();
        payment.confirm(dto.transactionId);
        return this.payments.save(payment, mgr);
      });
      return PaymentResponseDto.fromEntity(saved);
    } catch (err: any) {
      // unique 위반 (transaction_id 중복) → 409
      if (err?.code === '23505') {
        throw new HttpException(
          { code: 'TRANSACTION_ID_ALREADY_EXISTS', message: '이미 등록된 거래 ID입니다' },
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }
  }

  private assertOwner(userId: string, payment: PaymentEntity): void {
    if (payment.userId !== userId) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: '권한이 없습니다' });
    }
  }

  private notFound(): NotFoundException {
    return new NotFoundException({
      code: 'PAYMENT_NOT_FOUND',
      message: '결제를 찾을 수 없습니다',
    });
  }
}
