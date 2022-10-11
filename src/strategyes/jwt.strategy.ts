import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { BlackListRepository } from '../modules/auth/black-list.repository';
import { UsersRepository } from '../modules/users/users.repository';

// interface CustomRequest extends Request {
//   token: string;
// }

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private usersRepository: UsersRepository,
    private blackListRepository: BlackListRepository,
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
  // private static extractJWT(request: CustomRequest): string | null {
  private static extractJWT(request: Request): string | null {
    // console.log(request.token, 'req.token!!!');
    const data = request.cookies.refreshToken;
    // try {
    //   const obj = JSON.parse(data);
    //   obj.token = request.token;
    //   const refreshData = JSON.stringify(obj);
    // } catch (e) {
    //   console.log(e);
    // }
    if (data) {
      // return { ...data, cookie: true };
      // return refreshData;
      return data;
    }
    return null;
  }
  // async validate(req: Request, payload: any) {
  async validate(payload: any) {
    console.log(payload, 'payloaddd');
    if (!payload) {
      throw new BadRequestException('invalid jwt token');
    }
    const user = await this.usersRepository.getUserById(payload.id);
    // const isChecked = await this.blackListRepository.checkToken(payload.id);
    // if (!user && isChecked) {
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
