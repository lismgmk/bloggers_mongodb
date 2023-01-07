import {
  Catch,
  ExceptionFilter,
  HttpException,
  ArgumentsHost,
} from '@nestjs/common';
import { Response } from 'express';
import {
  getStatusCode,
  getErrorMessage,
} from './validation-body-exception-filter';

@Catch(Error)
export class CommonErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const statusCode = getStatusCode(exception);
    const request = context.getRequest<Request>();
    const message = getErrorMessage(exception);
    response.status(statusCode).json({
      // statusCode,
      // path: request.url,
      errorsMessages: message,
    });
  }
}
