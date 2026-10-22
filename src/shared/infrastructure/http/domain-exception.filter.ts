import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { Logger } from 'nestjs-pino';
import { DomainException } from '../../domain/exceptions/domain.exception';

const KIND_TO_STATUS: Record<DomainException['kind'], number> = {
  NOT_FOUND: HttpStatus.NOT_FOUND,
  INVALID_INPUT: HttpStatus.BAD_REQUEST,
  CONFLICT: HttpStatus.CONFLICT,
  FORBIDDEN: HttpStatus.FORBIDDEN,
  UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
};

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: DomainException, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status = KIND_TO_STATUS[exception.kind];

    this.logger.warn({
      msg: exception.message,
      errorKind: exception.kind,
      errorName: exception.name,
    });

    response.status(status).json({
      statusCode: status,
      error: exception.name,
      message: exception.message,
    });
  }
}
