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

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request & { user?: { sub?: string } }>();
    const response = http.getResponse<Response>();

    const traceId =
      (request.headers['x-trace-id'] as string | undefined) ?? randomUUID();
    const start = process.hrtime.bigint();
    const { method } = request;
    const path = request.originalUrl ?? request.url;

    return next.handle().pipe(
      tap({
        next: () => this.log(traceId, method, path, response.statusCode, start, request),
        error: (err) => {
          const statusCode =
            typeof err?.getStatus === 'function' ? err.getStatus() : 500;
          this.log(traceId, method, path, statusCode, start, request);
        },
      }),
    );
  }

  private log(
    traceId: string,
    method: string,
    path: string,
    statusCode: number,
    start: bigint,
    request: Request & { user?: { sub?: string } },
  ): void {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    this.logger.log(
      JSON.stringify({
        traceId,
        method,
        path,
        statusCode,
        durationMs: Math.round(durationMs * 1000) / 1000,
        userId: request.user?.sub ?? null,
      }),
    );
  }
}
