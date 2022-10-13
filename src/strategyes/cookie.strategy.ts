import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-cookie';
import { BlackListRepository } from '../modules/auth/black-list.repository';

@Injectable()
export class CookieStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private reflector: Reflector,
    private blackListRepository: BlackListRepository,
  ) {
    super({
      cookieName: 'refreshToken',
      signed: true,
      passReqToCallback: true,
    });
  }

  async validate(req, token) {
    // const request = context.switchToHttp().getRequest();
    // const refreshToken = request.cookies.refreshToken;
    // if (refreshToken) {
    //   const isChecked = await this.blackListRepository.checkToken(refreshToken);
    //   if (isChecked) {
    //     throw new BadRequestException();
    //   }
    //   await this.blackListRepository.addToken(refreshToken);
    // }
    // return super.canActivate(context);

    console.log(token, 'ddddddddddddddddddddddddddddddddddddddd');
    return token;
  }
}
