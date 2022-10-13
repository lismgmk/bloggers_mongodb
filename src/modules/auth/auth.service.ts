import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ObjectId } from 'mongoose';
import { JwtPassService } from '../../services/jwt-pass.service';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { IRegistrationDto } from './dto/auth-interfaces.dto';
import { v4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private jwtPassService: JwtPassService,
    private configService: ConfigService,
    private mailService: MailService,
    private usersService: UsersService,
  ) {}
  async getRefreshAccessToken(userId: ObjectId) {
    const expiredAccess = this.configService.get<string>('EXPIRED_ACCESS');
    const expiredRefresh = this.configService.get<string>('EXPIRED_REFRESH');

    const accessToken = await this.jwtPassService.createJwt(
      userId,
      expiredAccess,
    );
    const refreshToken = await this.jwtPassService.createJwt(
      userId,
      expiredRefresh,
    );
    return { accessToken, refreshToken };
  }
  async registration(dto: IRegistrationDto) {
    const confirmationCode = v4();
    await this.mailService.sendUserConfirmation(
      { email: dto.email, name: dto.login },
      confirmationCode,
    );
    const newUserDto = {
      login: dto.login,
      email: dto.email,
      password: dto.password,
      userIp: dto.userIp,
    };
    await this.usersService.createUser(newUserDto);
  }
}
