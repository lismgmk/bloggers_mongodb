import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { UsersRepository } from '../modules/users/users.repository';
import { JwtPassService } from '../services/jwt-pass.service';

// @UseFilters(new MongoExceptionFilter())
@Injectable()
export class CustomAuthGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private usersRepository: UsersRepository,
    private jwtPassService: JwtPassService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const token = this.reflector.get<string>('token', context.getHandler());
      console.log(token, 'ddddddd');
      let currentTokenType;
      if (token[0] === 'accessToken') {
        const accessToken = request.header.Authorization;
        currentTokenType = accessToken!.split(' ')[1];
      } else {
        currentTokenType = request.cookies.refreshToken;
      }
      const verifyUser = this.jwtPassService.verifyJwt(currentTokenType);
      const user =
        verifyUser && (await this.usersRepository.getUserById(verifyUser.id!));
      request.user = user;
      return !!(verifyUser && user);
    } catch (err) {
      console.log(err);
    }

    // const attemptsLimit = Number(
    //   this.configService.get<string>('ATTEMPTS_LIMIT'),
    // );
    // const request = context.switchToHttp().getRequest();
    // const usersLoginDiffIp = await this.ipUsersRepositoryDB.usersLoginDiffIp({
    //   userIp: 'userIp',
    //   filter: { path: request.path },
    // });
    // const findAllUsersIp = await this.ipUsersRepositoryDB.getAllUsersIp({
    //   userIp: request.ip,
    //   path: request.path,
    // });
    // if (findAllUsersIp.length < attemptsLimit) {
    //   await this.ipUsersRepositoryDB.createUsersIp({
    //     userIp: request.ip,
    //     path: request.path,
    //   });
    //   return true;
    // }
    // return !(
    //   findAllUsersIp.length >= attemptsLimit ||
    //   usersLoginDiffIp.length >= attemptsLimit
    // );
  }
}
