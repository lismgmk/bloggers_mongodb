import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class CookieAuthGuard extends AuthGuard('cookie') {
  // async canActivate(context: ExecutionContext): Promise<any> {
  //   console.log(context, 'dddddddddddddddd');
  //   return super.canActivate(context);
  // }
}
