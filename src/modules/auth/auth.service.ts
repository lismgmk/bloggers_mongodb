import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { v4 } from 'uuid';
import { User } from '../../schemas/users.schema';
import { JwtPassService } from '../common-services/jwt-pass-custom/jwt-pass.service';
import { MailService } from '../common-services/mail/mail.service';
import { UsersService } from '../users/users.service';
import {
  IRegistrationConfirmationResponse,
  IRegistrationDto,
} from './dto/auth-interfaces.dto';
import { GetNewPasswordDto } from './dto/get-new-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtPassService: JwtPassService,
    private configService: ConfigService,
    private mailService: MailService,
    private usersService: UsersService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}
  async getRefreshAccessToken(
    userId: string,
    deviceId: Types.ObjectId | string,
  ) {
    const expiredAccess = this.configService.get<string>('EXPIRED_ACCESS');
    const expiredRefresh = this.configService.get<string>('EXPIRED_REFRESH');

    const accessToken = await this.jwtPassService.createJwtAccess(
      userId,
      expiredAccess,
    );
    const refreshToken = await this.jwtPassService.createJwtRefresh(
      userId,
      expiredRefresh,
      deviceId,
    );
    return { accessToken, refreshToken };
  }

  async registration(dto: IRegistrationDto) {
    const confirmationCode = new Date();
    const newUserDto = {
      login: dto.login,
      email: dto.email,
      password: dto.password,
      userIp: dto.userIp,
      confirmationCode,
    };
    await this.mailService.sendUserConfirmation(
      { email: dto.email, name: dto.login },
      confirmationCode,
    );
    await this.usersService.createUser(newUserDto);
  }

  async resendingEmail(email: string) {
    const filter = { 'accountData.email': { $eq: email } };
    const currentUser = await this.userModel.find(filter);
    if (!currentUser.length) {
      throw new UnauthorizedException();
    }
    const confirmationCode = v4();
    await this.mailService.sendUserConfirmation(
      { email, name: currentUser[0].accountData.userName },
      confirmationCode,
    );
    currentUser[0].emailConfirmation.confirmationCode = confirmationCode;
    currentUser[0].save();
    return currentUser;
  }

  async passwordRecovery(email: string) {
    const filter = { 'accountData.email': { $eq: email } };
    const currentUser = await this.userModel.find(filter);
    if (!currentUser.length) {
      throw new UnauthorizedException();
    }
    const confirmationCode = v4();
    await this.mailService.sendUserConfirmation(
      { email, name: currentUser[0].accountData.userName },
      confirmationCode,
    );
    currentUser[0].emailConfirmation.confirmationCode = confirmationCode;
    currentUser[0].emailConfirmation.isConfirmed = false;
    currentUser[0].save();
    return currentUser;
  }

  async getNewPassword(dto: GetNewPasswordDto) {
    const filter = {
      'emailConfirmation.confirmationCode': { $eq: dto.recoveryCode },
    };
    const currentUser = (await this.userModel.find(filter)) as User[];
    if (!currentUser.length) {
      throw new UnauthorizedException();
    }
    if (
      currentUser[0].emailConfirmation.confirmationCode !== dto.recoveryCode
    ) {
      throw new UnauthorizedException();
    }
    currentUser[0].emailConfirmation.isConfirmed = true;
    const hashPassword = await this.jwtPassService.createPassBcrypt(
      dto.newPassword,
    );
    currentUser[0].accountData.passwordHash = hashPassword;
    await currentUser[0].save();
  }

  async registrationConfirmation(code: string) {
    const filter = {
      'emailConfirmation.confirmationCode': { $eq: code },
    };
    const currentUser = (await this.userModel.find(filter)) as User[];
    if (!currentUser.length) {
      throw new UnauthorizedException();
    }
    currentUser[0].emailConfirmation.isConfirmed = true;
    await currentUser[0].save();
    return {
      id: currentUser[0]._id,
      login: currentUser[0].accountData.userName,
      email: currentUser[0].accountData.email,
      createdAt: currentUser[0].accountData.createdAt,
    } as IRegistrationConfirmationResponse;
  }
}
