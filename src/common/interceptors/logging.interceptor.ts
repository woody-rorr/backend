import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

const MASK = '***';
const SENSITIVE_KEYS = ['password', 'passwordhash', 'authorization', 'token', 'accesstoken'];

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const h = request.headers['x-trace-id'];
    const traceId = (Array.isArray(h) ? h[0] : h) ?? randomUUID();
    request.headers['x-trace-id'] = traceId;
    const method = request.method;
    const path = request.originalUrl ?? request.url;
    const start = Date.now();
    return next.handle().pipe(tap({
      next: () => this.write(traceId, method, path, response.statusCode, start, request),
      error: (err: { status?: number }) => this.write(traceId, method, path, err?.status ?? 500, start, request),
    }));
  }
  private write(traceId: string, method: string, path: string, statusCode: number, start: number, request: Request): void {
    const userId = (request as Request & { user?: { sub?: string } }).user?.sub ?? null;
    this.logger.log(JSON.stringify({ traceId, method, path, statusCode, durationMs: Date.now() - start, userId, body: this.mask(request.body) }));
  }
  private mask(value: unknown): unknown {
    if (!value || typeof value !== 'object') return value;
    if (Array.isArray(value)) return value.map(i => this.mask(i));
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SENSITIVE_KEYS.includes(k.toLowerCase()) ? MASK : this.mask(v);
    }
    return out;
  }
}
