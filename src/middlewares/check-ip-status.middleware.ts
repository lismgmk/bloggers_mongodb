import {
  Injectable,
  NestMiddleware,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { IpUsersRepository } from '../repositotyes/ip-user.repository';

@Injectable()
export class CheckIpStatusMiddleware implements NestMiddleware {
  constructor(
    private configService: ConfigService,
    private ipUsersRepository: IpUsersRepository,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const attemptsLimit = Number(
      this.configService.get<string>('ATTEMPTS_LIMIT'),
    );

    const usersLoginDiffIp = await this.ipUsersRepository.usersLoginDiffIp({
      userIp: 'userIp',
      filter: { path: req.path },
    });
    const findAllUsersIp = await this.ipUsersRepository.getAllUsersIp({
      userIp: req.ip,
      path: req.path,
    });
    if (
      findAllUsersIp.length >= attemptsLimit ||
      usersLoginDiffIp.length >= attemptsLimit
    ) {
      throw new HttpException(
        'Too many request from one ip',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    await this.ipUsersRepository.createUsersIp({
      userIp: req.ip,
      path: req.path,
    });
    return next();
  }
}
