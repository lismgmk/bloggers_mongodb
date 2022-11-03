import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from '../modules/users/users.repository';
import { User } from '../schemas/users.schema';
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
      usernameField: 'login',
    });
  }

  async validate(username: string, password: string): Promise<any> {
    const user = (await this.usersRepository.getUserByLogin(username)) as User;
    let isMatchPass;
    console.log(
      user,
      'uer!!!!!!!!!!!!!!',
      this.configService.get<string>('DB_CONN_MONGOOSE_STRING'),
    );
    if (user) {
      isMatchPass = await this.jwtPassService.checkPassBcrypt(
        password,
        user.accountData.passwordHash,
      );
    }

    if (!user || !isMatchPass) {
      throw new UnauthorizedException();
    }
    return user._id;
  }
}
