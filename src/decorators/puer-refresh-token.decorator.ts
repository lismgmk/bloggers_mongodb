import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const PuerRefresgToken = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.cookies.refreshToken;
  },
);
