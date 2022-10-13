import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersRepository } from '../modules/users/users.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private usersRepository: UsersRepository,
  ) {
    super({
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('SECRET'),
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
    });
  }
  private static extractJWT(request: Request): string | null {
    const data = request.cookies.refreshToken;
    if (data) {
      return data;
    }
    return null;
  }
  async validate(payload: any) {
    if (!payload) {
      throw new BadRequestException('invalid jwt token');
    }
    const user = await this.usersRepository.getUserById(payload.id);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
