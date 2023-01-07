import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { compareDesc } from 'date-fns';
import { Model, Types } from 'mongoose';
import { BadRequestError } from 'passport-headerapikey';
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
    const confirmationCode = new Date().toISOString();
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
    const currentUser = await this.userModel.findOne(filter);
    if (!currentUser) {
      throw new UnauthorizedException();
    }
    if (currentUser.emailConfirmation.isConfirmed) {
      throw new BadRequestException();
    }
    const confirmationCode = new Date().toISOString();
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
    if (currentUser) {
      const confirmationCode = new Date().toISOString();
      await this.mailService.sendUserConfirmation(
        { email, name: currentUser.accountData.userName },
        confirmationCode,
      );
      currentUser.emailConfirmation.confirmationCode = confirmationCode;
      currentUser.emailConfirmation.isConfirmed = false;
      currentUser.save();
    }

    return currentUser;
  }

  async getNewPassword(dto: GetNewPasswordDto) {
    const filter = {
      'emailConfirmation.confirmationCode': {
        $eq: new Date(dto.recoveryCode),
      },
    };

    const currentUser = (await this.userModel.findOne(filter)) as User;
    if (!currentUser) {
      throw new UnauthorizedException();
    }

    if (
      compareDesc(
        new Date(currentUser.emailConfirmation.confirmationCode),
        new Date(dto.recoveryCode),
      ) !== 0
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

  async registrationConfirmation(code: Date) {
    const filter = {
      'emailConfirmation.confirmationCode': { $eq: code },
    };
    const currentUser = (await this.userModel.findOne(filter)) as User;
    if (!currentUser) {
      throw new UnauthorizedException();
    }
    if (currentUser.emailConfirmation.isConfirmed) {
      throw new BadRequestException();
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
