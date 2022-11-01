import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetDeviceId = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.deviceId;
  },
);
