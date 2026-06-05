import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';

type ErrorBody = {
  code: string;
  message: string;
  details?: unknown;
  traceId: string;
};

const EXCEPTION_CODE_MAP: Record<string, string> = {
  BadRequestException: 'VALIDATION_ERROR',
  NotFoundException: 'RESOURCE_NOT_FOUND',
  ConflictException: 'CONFLICT',
  UnauthorizedException: 'UNAUTHORIZED',
  ForbiddenException: 'FORBIDDEN',
  UnprocessableEntityException: 'BUSINESS_RULE_VIOLATION',
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const traceId =
      (request.headers['x-trace-id'] as string | undefined) ?? randomUUID();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: ErrorBody = {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      traceId,
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      const className = exception.constructor.name;
      const mappedCode = EXCEPTION_CODE_MAP[className] ?? 'HTTP_ERROR';

      if (typeof res === 'string') {
        body = { code: mappedCode, message: res, traceId };
      } else if (res && typeof res === 'object') {
        const r = res as Record<string, unknown>;
        body = {
          code: (r.code as string) ?? mappedCode,
          message:
            (r.message as string) ??
            (Array.isArray(r.message) ? r.message.join(', ') : mappedCode),
          details: r.details ?? (Array.isArray(r.message) ? r.message : undefined),
          traceId,
        };
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled exception [${traceId}]: ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.error(`Unknown exception [${traceId}]: ${String(exception)}`);
    }

    response.setHeader('x-trace-id', traceId);
    response.status(status).json(body);
  }
}
