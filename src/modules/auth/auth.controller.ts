import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Ip,
  Post,
  Res,
  UnauthorizedException,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

import { Response } from 'express';
import mongoose from 'mongoose';
import { DeviceName } from '../../decorators/device-name.decorator';
import { GetDeviceId } from '../../decorators/get-device-id.decorator';
import { GetUser } from '../../decorators/get-user.decorator';
import { PuerRefresgToken } from '../../decorators/puer-refresh-token.decorator';
import { UserIp } from '../../decorators/user-ip.decorator';
import { CommonErrorFilter } from '../../exceptions/common-error-filter';
import { MongoExceptionFilter } from '../../exceptions/mongoose-exception-filter';
import { ValidationBodyExceptionFilter } from '../../exceptions/validation-body-exception-filter';
import { CookieGuard } from '../../guards/cookie.guard';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { LocalStrategyGuard } from '../../guards/local-strategy.guard';
import { CustomValidationPipe } from '../../pipes/validation.pipe';
import { User } from '../../schemas/users/users.schema';
import { SecurityService } from '../security/security.service';
import { CreateUserDto } from '../users/instance_dto/dto_validate/create-user.dto';
import { AuthService } from './auth.service';
import { BlackListRepository } from './black-list.repository';
import { CodeAuthDto } from './dto/code-auth.dto copy';
import { GetNewPasswordDto } from './dto/get-new-password.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ResendingEmailDto } from './dto/resending-email.dto';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly securityService: SecurityService,
    private readonly blackListRepository: BlackListRepository,
  ) {}

  @HttpCode(204)
  @Post('/registration')
  @UseFilters(new MongoExceptionFilter())
  @UseFilters(new ValidationBodyExceptionFilter())
  @UseFilters(new CommonErrorFilter())
  async createUser(
    @Ip() userIp: string,
    @Body(new CustomValidationPipe()) createUser: CreateUserDto,
  ) {
    return this.authService.registration({ ...createUser, userIp });
  }
  @HttpCode(200)
  @Post('/refresh-token')
  @SkipThrottle()
  @UseFilters(new ValidationBodyExceptionFilter())
  @UseFilters(new CommonErrorFilter())
  @UseFilters(new MongoExceptionFilter())
  @UseGuards(CookieGuard)
  async getRefreshAccessToken(
    @Res({ passthrough: true }) res: Response,
    @GetUser() user: User,
    @GetDeviceId()
    deviceId: string,
    @PuerRefresgToken()
    refreshToken: string,
  ) {
    await this.blackListRepository.addToken(refreshToken);
    const tokens = await this.authService.getRefreshAccessToken(
      user._id,
      deviceId,
    );
    await this.securityService.updateDevice({
      // userId: user._id,
      _id: deviceId,
    });
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken: tokens.accessToken };
  }

  @HttpCode(200)
  @Post('/login')
  @UseFilters(new ValidationBodyExceptionFilter())
  @UseFilters(new CommonErrorFilter())
  @UseFilters(new MongoExceptionFilter())
  @UseGuards(LocalStrategyGuard)
  async login(
    @GetUser() user: User,
    @Res({ passthrough: true }) res: Response,
    @Body(new CustomValidationPipe()) loginAuthDto: LoginAuthDto,
    @UserIp() userIp: string,
    @DeviceName() deviceName: string,
  ) {
    if (user.banInfo.isBanned === true) {
      throw new UnauthorizedException('user is banned');
    }
    if (user.emailConfirmation.isConfirmed === false) {
      throw new BadRequestException('unConfirmed user');
    }

    const deviceId = new mongoose.Types.ObjectId();
    console.log(deviceId);

    const currentDevice = await this.securityService.createDevice({
      ip: userIp,
      userId: user._id,
      deviceName,
      deviceId: deviceId,
    });

    const tokens = await this.authService.getRefreshAccessToken(
      user._id,
      currentDevice._id,
    );
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken: tokens.accessToken };
  }

  @HttpCode(204)
  @Post('/registration-email-resending')
  @UseFilters(new ValidationBodyExceptionFilter())
  @UseFilters(new CommonErrorFilter())
  // @UsePipes(
  //   new ValidationPipe({
  //     stopAtFirstError: true,
  //   }),
  // )
  @UseFilters(new MongoExceptionFilter())
  async registrationEmailResending(
    @Res({ passthrough: true }) res: Response,
    @Body(new CustomValidationPipe({ stopAtFirstError: true }))
    resendingEmail: ResendingEmailDto,
  ) {
    return this.authService.resendingEmail(resendingEmail.email);
  }

  @HttpCode(204)
  @Post('/password-recovery')
  @UseFilters(new ValidationBodyExceptionFilter())
  @UseFilters(new CommonErrorFilter())
  @UseFilters(new MongoExceptionFilter())
  async passwordRecovery(
    @Body(new CustomValidationPipe()) resendingEmail: ResendingEmailDto,
  ) {
    return this.authService.passwordRecovery(resendingEmail.email);
  }

  @HttpCode(204)
  @Post('/new-password')
  @UseFilters(new ValidationBodyExceptionFilter())
  @UseFilters(new CommonErrorFilter())
  @UseFilters(new MongoExceptionFilter())
  async getNewPassword(
    @Body(new CustomValidationPipe()) getNewPassword: GetNewPasswordDto,
  ) {
    return this.authService.getNewPassword(getNewPassword);
  }

  @HttpCode(204)
  @Post('/registration-confirmation')
  @UseFilters(new CommonErrorFilter())
  @UseFilters(new MongoExceptionFilter())
  async registrationConfirmation(
    @Body(new CustomValidationPipe()) code: CodeAuthDto,
  ) {
    return this.authService.registrationConfirmation(code.code);
  }

  @HttpCode(204)
  @Post('/logout')
  @SkipThrottle()
  @UseFilters(new CommonErrorFilter())
  @UseFilters(new MongoExceptionFilter())
  @UseGuards(CookieGuard)
  async logout(
    @GetUser() user: User,
    @GetDeviceId()
    deviceId: string,
    @PuerRefresgToken()
    refreshToken: string,
  ) {
    await this.securityService.deleteCurrentDevice(deviceId, user._id);
    await this.blackListRepository.addToken(refreshToken);
    return;
  }

  @HttpCode(200)
  @Get('/me')
  @SkipThrottle()
  @UseFilters(new CommonErrorFilter())
  @UseFilters(new MongoExceptionFilter())
  @UseGuards(JwtAuthGuard)
  async me(@GetUser() user: User) {
    return {
      email: user.accountData.email,
      login: user.accountData.userName,
      userId: user._id,
    };
  }
}
