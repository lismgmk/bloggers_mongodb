import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IpUsersRepository } from '../repositotyes/ip-user.repository';

// @UseFilters(new MongoExceptionFilter())
@Injectable()
export class IpStatusGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private ipUsersRepositoryDB: IpUsersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const attemptsLimit = Number(
      this.configService.get<string>('ATTEMPTS_LIMIT'),
    );
    const request = context.switchToHttp().getRequest();
    const usersLoginDiffIp = await this.ipUsersRepositoryDB.usersLoginDiffIp({
      userIp: 'userIp',
      filter: { path: request.path },
    });
    const findAllUsersIp = await this.ipUsersRepositoryDB.getAllUsersIp({
      userIp: request.ip,
      path: request.path,
    });
    if (findAllUsersIp.length < attemptsLimit) {
      await this.ipUsersRepositoryDB.createUsersIp({
        userIp: request.ip,
        path: request.path,
      });
      return true;
    }
    return !(
      findAllUsersIp.length >= attemptsLimit ||
      usersLoginDiffIp.length >= attemptsLimit
    );
  }
}
