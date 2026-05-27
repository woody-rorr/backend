import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface AuthenticatedRequest extends Request {
  traceId?: string;
  user?: { sub?: string };
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<AuthenticatedRequest>();
    const response = ctx.getResponse<Response>();

    const traceId =
      (request.headers['x-trace-id'] as string | undefined) ?? randomUUID();
    request.traceId = traceId;
    response.setHeader('x-trace-id', traceId);

    const start = Date.now();
    const method = request.method;
    const path = request.originalUrl;

    const log = (statusCode: number): void => {
      this.logger.log(
        JSON.stringify({
          traceId,
          method,
          path,
          statusCode,
          durationMs: Date.now() - start,
          userId: request.user?.sub ?? null,
        }),
      );
    };

    return next.handle().pipe(
      tap({
        next: () => log(response.statusCode),
        error: (err: { status?: number }) => log(err?.status ?? 500),
      }),
    );
  }
}
