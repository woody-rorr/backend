import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';

const CODE_MAP: Record<number, string> = {
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
    const request = ctx.getRequest<Request>();
    const h = request.headers['x-trace-id'];
    const traceId = (Array.isArray(h) ? h[0] : h) ?? randomUUID();
    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'Internal server error';
    let details: unknown;
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      code = CODE_MAP[status] ?? 'INTERNAL_ERROR';
      const res = exception.getResponse();
      if (typeof res === 'string') { message = res; }
      else if (res && typeof res === 'object') {
        const body = res as Record<string, unknown>;
        if (typeof body.code === 'string') code = body.code;
        if (typeof body.message === 'string') message = body.message;
        else if (Array.isArray(body.message)) { message = 'Validation failed'; details = body.message; }
        if (body.details !== undefined) details = body.details;
      }
    }
    if (status >= 500) this.logger.error(JSON.stringify({ traceId, code, message, path: request.url }), exception instanceof Error ? exception.stack : undefined);
    const payload: Record<string, unknown> = { code, message, traceId };
    if (details !== undefined) payload.details = details;
    response.setHeader('x-trace-id', traceId);
    response.status(status).json(payload);
  }
}
