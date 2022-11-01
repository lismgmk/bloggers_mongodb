import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const DeviceName = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['user-agent'];
  },
);
