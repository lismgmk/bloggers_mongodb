import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../schemas/users.schema';

export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // const token = this.reflector.get<string>('token', context.getHandler());
    return request.user as User;
  },
);
