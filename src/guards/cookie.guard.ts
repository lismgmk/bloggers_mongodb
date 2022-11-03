import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { BlackListRepository } from '../modules/auth/black-list.repository';
import { JwtPassService } from '../modules/common-services/jwt-pass-custom/jwt-pass.service';
import { UsersRepository } from '../modules/users/users.repository';

@Injectable()
export class CookieGuard implements CanActivate {
  constructor(
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
    const payload = this.jwtPassService.decodeJwt(refreshToken) as {
      id: string;
      deviceId: string;
      iat: string;
      exp: string;
    };
    const user = await this.usersRepository.getUserById(payload.id);
    const verify = await this.jwtPassService.verifyJwt(refreshToken);
    if (isChecked.length > 0 || !verify || !user) {
      throw new UnauthorizedException();
    }

    request.deviceId = payload.deviceId;
    request.user = user;
    return true;
  }
}
