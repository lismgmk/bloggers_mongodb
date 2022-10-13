import {
  Injectable,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { BlackListRepository } from '../modules/auth/black-list.repository';

// @UseFilters(new MongoExceptionFilter())
@Injectable()
export class JWTAuthCustomGuard extends AuthGuard('jwt') {
  // export class CustomAuthGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private reflector: Reflector,
    private blackListRepository: BlackListRepository,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.cookies.refreshToken;
    if (refreshToken) {
      const isChecked = await this.blackListRepository.checkToken(refreshToken);
      if (isChecked) {
        throw new BadRequestException();
      }
      await this.blackListRepository.addToken(refreshToken);
    }
    return super.canActivate(context);
  }
}
