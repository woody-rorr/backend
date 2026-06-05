import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';
import { randomUUID } from 'crypto';

const SENSITIVE_HEADERS = ['authorization', 'cookie', 'x-api-key'];
const SENSITIVE_BODY_KEYS = ['password', 'passwordHash', 'token', 'secret'];

function maskBody(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(maskBody);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = SENSITIVE_BODY_KEYS.includes(k) ? '[REDACTED]' : maskBody(v);
  }
  return out;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const traceId =
      (req.headers['x-trace-id'] as string | undefined) ?? randomUUID();
    req.headers['x-trace-id'] = traceId;
    res.setHeader('x-trace-id', traceId);

    const start = Date.now();
    const userId =
      (req as Request & { user?: { sub?: string } }).user?.sub ?? null;

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log(
            JSON.stringify({
              traceId,
              method: req.method,
              path: req.originalUrl,
              statusCode: res.statusCode,
              durationMs: Date.now() - start,
              userId,
            }),
          );
        },
        error: (err: Error) => {
          this.logger.error(
            JSON.stringify({
              traceId,
              method: req.method,
              path: req.originalUrl,
              statusCode: res.statusCode,
              durationMs: Date.now() - start,
              userId,
              error: err.message,
            }),
          );
        },
      }),
    );
  }
}

export { maskBody, SENSITIVE_HEADERS };
