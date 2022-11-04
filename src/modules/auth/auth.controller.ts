import {
  Body,
  Controller,
  Get,
  HttpCode,
  Ip,
  Post,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { Response } from 'express';
import mongoose from 'mongoose';
import { DeviceName } from '../../decorators/device-name.decorator';
import { GetDeviceId } from '../../decorators/get-device-id.decorator';
import { GetUserId } from '../../decorators/get-user-id.decorator';
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
import { User } from '../../schemas/users.schema';
import { SecurityService } from '../security/security.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { BlackListRepository } from './black-list.repository';
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
  @UseFilters(new ValidationBodyExceptionFilter())
  @UseFilters(new CommonErrorFilter())
  @UseFilters(new MongoExceptionFilter())
  @UseGuards(CookieGuard)
  async getRefreshAccessToken(
    @GetUser() user: User,
    @Res({ passthrough: true }) res: Response,
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
      userId: user._id,
      deviceId,
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
    @GetUserId() userId: string,
    @Res({ passthrough: true }) res: Response,
    @Body(new CustomValidationPipe()) loginAuthDto: LoginAuthDto,
    @UserIp() userIp: string,
    @DeviceName() deviceName: string,
  ) {
    const deviceId = new mongoose.Types.ObjectId();
    const tokens = await this.authService.getRefreshAccessToken(
      userId,
      deviceId,
    );

    await this.securityService.createDevice({
      ip: userIp,
      userId,
      deviceName,
      deviceId: deviceId,
    });
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
  @UseFilters(new MongoExceptionFilter())
  async registrationEmailResending(
    @Res({ passthrough: true }) res: Response,
    @Body(new CustomValidationPipe()) resendingEmail: ResendingEmailDto,
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
  async getNewPassword(@Body() getNewPassword: GetNewPasswordDto) {
    return this.authService.getNewPassword(getNewPassword);
  }

  @HttpCode(204)
  @Post('/registration-confirmation')
  @UseFilters(new CommonErrorFilter())
  @UseFilters(new MongoExceptionFilter())
  async registrationConfirmation(@Body() code: { code: string }) {
    return this.authService.registrationConfirmation(code.code);
  }

  @HttpCode(204)
  @Post('/logout')
  @UseFilters(new CommonErrorFilter())
  @UseFilters(new MongoExceptionFilter())
  @UseGuards(CookieGuard)
  async logout(
    @PuerRefresgToken()
    refreshToken: string,
  ) {
    await this.blackListRepository.addToken(refreshToken);
    return;
  }

  @HttpCode(200)
  @Get('/me')
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
