import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserIp = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.ip;
  },
);
