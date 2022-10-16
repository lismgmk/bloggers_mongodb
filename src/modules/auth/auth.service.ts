import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId, Model } from 'mongoose';
import { User } from '../../schemas/users.schema';
import { JwtPassService } from '../jwt-pass/jwt-pass.service';
import { MailService } from '../mail/mail.service';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';
import { BlackListRepository } from './black-list.repository';
import {
  IRegistrationDto,
  IRegistrationConfirmationResponse,
} from './dto/auth-interfaces.dto';
import { v4 } from 'uuid';
import { GetNewPasswordDto } from './dto/get-new-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtPassService: JwtPassService,
    private configService: ConfigService,
    private mailService: MailService,
    private usersService: UsersService,
    private usersRepository: UsersRepository,
    private blackListRepository: BlackListRepository,
    @InjectModel(User.name) private userModel: Model<User>,
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
    const newUserDto = {
      login: dto.login,
      email: dto.email,
      password: dto.password,
      userIp: dto.userIp,
    };
    await this.mailService.sendUserConfirmation(
      { email: dto.email, name: dto.login },
      confirmationCode,
    );
    await this.usersService.createUser(newUserDto);
  }

  async resendingEmail(email: string) {
    const filter = { 'accountData.email': { $eq: email } };
    const currentUser = await this.userModel.findOne(filter);
    if (!currentUser) {
      throw new UnauthorizedException();
    }
    const confirmationCode = v4();
    await this.mailService.sendUserConfirmation(
      { email, name: currentUser.accountData.userName },
      confirmationCode,
    );
    currentUser.emailConfirmation.confirmationCode = confirmationCode;
    currentUser.save();
    return currentUser;
  }

  async passwordRecovery(email: string) {
    const filter = { 'accountData.email': { $eq: email } };
    const currentUser = await this.userModel.findOne(filter);
    if (!currentUser) {
      throw new UnauthorizedException();
    }
    const confirmationCode = v4();
    await this.mailService.sendUserConfirmation(
      { email, name: currentUser.accountData.userName },
      confirmationCode,
    );
    currentUser.emailConfirmation.confirmationCode = confirmationCode;
    currentUser.emailConfirmation.isConfirmed = false;
    currentUser.save();
    return currentUser;
  }

  async getNewPassword(dto: GetNewPasswordDto) {
    const filter = {
      'emailConfirmation.confirmationCode': { $eq: dto.recoveryCode },
    };
    const currentUser = (await this.userModel.findOne(filter)) as User;
    if (
      !currentUser ||
      currentUser.emailConfirmation.confirmationCode !== dto.recoveryCode
    ) {
      throw new UnauthorizedException();
    }
    currentUser.emailConfirmation.isConfirmed = true;
    const hashPassword = await this.jwtPassService.createPassBcrypt(
      dto.newPassword,
    );
    currentUser.accountData.passwordHash = hashPassword;
    await currentUser.save();
  }

  async registrationConfirmation(code: string) {
    const filter = {
      'emailConfirmation.confirmationCode': { $eq: code },
    };
    const currentUser = (await this.userModel.findOne(filter)) as User;
    if (!currentUser) {
      throw new UnauthorizedException();
    }
    currentUser.emailConfirmation.isConfirmed = true;
    await currentUser.save();
    return {
      id: currentUser._id,
      login: currentUser.accountData.userName,
      email: currentUser.accountData.email,
      createdAt: currentUser.accountData.createdAt,
    } as IRegistrationConfirmationResponse;
  }
}
