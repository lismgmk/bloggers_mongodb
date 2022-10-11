import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '../../schemas/users.schema';
import { JwtPassService } from '../../services/jwt-pass.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtPassService: JwtPassService,
    private configService: ConfigService,
  ) {}
  async getRefreshAccessToken(user: User) {
    const expiredAccess = this.configService.get<string>('EXPIRED_ACCESS');
    const expiredRefresh = this.configService.get<string>('EXPIRED_REFRESH');

    const accessToken = await this.jwtPassService.createJwt(
      user!._id!,
      expiredAccess,
    );
    const refreshToken = await this.jwtPassService.createJwt(
      user!._id!,
      expiredRefresh,
    );
    return { accessToken, refreshToken };
  }
}
