import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from '../modules/users/users.repository';
import { User } from '../schemas/users/users.schema';
import { JwtPassService } from '../modules/common-services/jwt-pass-custom/jwt-pass.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersRepository: UsersRepository,
    private jwtPassService: JwtPassService,
    private configService: ConfigService,
  ) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(userNameEmail: string, password: string): Promise<any> {
    const user = (await this.usersRepository.getUserByLogin(
      userNameEmail,
    )) as User;
    const userEmail = (await this.usersRepository.getUserByEmail(
      userNameEmail,
    )) as User;
    let isMatchPass;

    if (user || userEmail) {
      isMatchPass = await this.jwtPassService.checkPassBcrypt(
        password,
        user.accountData.passwordHash,
      );
    }

    if ((!userEmail && !user) || !isMatchPass) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
