import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
export interface HttpExceptionResponse {
  statusCode: number;
  message: any;
  error: string;
}
export const getStatusCode = <T>(exception: T): number => {
  return exception instanceof HttpException
    ? exception.getStatus()
    : HttpStatus.INTERNAL_SERVER_ERROR;
};

// export const getErrorMessage = <T>(exception: T): string => {
//   return exception instanceof HttpException
//     ? exception.message
//     : String(exception);
// };
export const getErrorMessage = <T>(exception: T): any => {
  if (exception instanceof HttpException) {
    const errorResponse = exception.getResponse();
    const errorMessage =
      (errorResponse as HttpExceptionResponse).message || exception.message;

    return errorMessage;
  } else {
    return String(exception);
  }
};
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const statusCode = getStatusCode(exception);
    const message = getErrorMessage(exception);
    response.status(statusCode).json({
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
