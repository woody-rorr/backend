import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';

interface TracedRequest extends Request {
  traceId?: string;
}

interface ErrorBody {
  code: string;
  message: string;
  details?: unknown;
  traceId: string;
}

const STATUS_CODE_MAP: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'VALIDATION_ERROR',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'RESOURCE_NOT_FOUND',
  [HttpStatus.CONFLICT]: 'CONFLICT',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'BUSINESS_RULE_VIOLATION',
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<TracedRequest>();

    const traceId =
      request.traceId ??
      (request.headers['x-trace-id'] as string | undefined) ??
      randomUUID();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'Internal server error';
    let details: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      code = STATUS_CODE_MAP[status] ?? 'INTERNAL_ERROR';
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (res && typeof res === 'object') {
        const r = res as Record<string, unknown>;
        if (Array.isArray(r.message)) {
          message = 'Validation failed';
          details = { errors: r.message };
        } else if (typeof r.message === 'string') {
          message = r.message;
        } else {
          message = exception.message;
        }
      }
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        JSON.stringify({
          traceId,
          method: request.method,
          path: request.url,
          message:
            exception instanceof Error ? exception.message : 'Unknown error',
        }),
        exception instanceof Error ? exception.stack : undefined,
      );
      code = 'INTERNAL_ERROR';
      message = 'Internal server error';
      details = undefined;
    }

    const body: ErrorBody = { code, message, traceId };
    if (details !== undefined) {
      body.details = details;
    }

    response.status(status).json(body);
  }
}
