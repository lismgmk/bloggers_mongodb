import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtPassService } from 'modules/common-services/jwt-pass/jwt-pass.service';
import { UsersRepository } from 'modules/users/users.repository';

@Injectable()
export class CheckBearerMiddleware implements NestMiddleware {
  constructor(
    private jwtPassService: JwtPassService,
    private usersRepository: UsersRepository,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const accessToken = authHeader.split(' ')[1];
      if (accessToken) {
        const verifyUser = await this.jwtPassService.verifyJwt(accessToken);
        if (verifyUser) {
          const user = await this.usersRepository.getUserById(verifyUser.id);
          req.user = user;
        }
      }
      return next();
    }
  }
}
