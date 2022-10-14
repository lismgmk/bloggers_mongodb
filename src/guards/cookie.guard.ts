import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlackListRepository } from '../modules/auth/black-list.repository';
import { JwtPassService } from '../modules/jwt-pass/jwt-pass.service';
import { UsersRepository } from '../modules/users/users.repository';

@Injectable()
export class CookieGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private blackListRepository: BlackListRepository,
    private jwtPassService: JwtPassService,
    private usersRepository: UsersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.cookies.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    const isChecked = await this.blackListRepository.checkToken(refreshToken);
    const userId = this.jwtPassService.decodeJwt(refreshToken) as {
      id: string;
      iat: string;
      exp: string;
    };
    const user = this.usersRepository.getUserById(userId.id);
    if (isChecked || !this.jwtPassService.verifyJwt(refreshToken) || !user) {
      throw new UnauthorizedException();
    }
    await this.blackListRepository.addToken(refreshToken);

    request.user = user;
    return true;
  }
}
