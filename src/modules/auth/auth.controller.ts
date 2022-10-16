import {
  Controller,
  Post,
  UseFilters,
  Ip,
  Body,
  UseGuards,
  Res,
  HttpCode,
  Get,
} from '@nestjs/common';
import { Response } from 'express';
import { ObjectId } from 'mongoose';
import { GetUserId } from '../../decorators/get-user-id.decorator';
import { GetUser } from '../../decorators/get-user.decorator';
import { CommonErrorFilter } from '../../exceptions/common-error-filter';
import { MongoExceptionFilter } from '../../exceptions/mongoose-exception-filter';
import { ValidationBodyExceptionFilter } from '../../exceptions/validation-body-exception-filter';
import { CookieGuard } from '../../guards/cookie.guard';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { LocalStrategyGuard } from '../../guards/local-strategy.guard';
import { CustomValidationPipe } from '../../pipes/validation.pipe';
import { User } from '../../schemas/users.schema';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { GetNewPasswordDto } from './dto/get-new-password.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ResendingEmailDto } from './dto/resending-email.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(204)
  @Post('/registration')
  @UseFilters(new MongoExceptionFilter())
  @UseFilters(new ValidationBodyExceptionFilter())
  @UseFilters(new CommonErrorFilter())
  async createUser(
    @Ip() userIp: string,
    @Body(new CustomValidationPipe()) createUserDto: CreateUserDto,
  ) {
    console.log(createUserDto);
    return this.authService.registration({ ...createUserDto, userIp });
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
  ) {
    const tokens = await this.authService.getRefreshAccessToken(user._id);
    res.cookie('accessToken', tokens.refreshToken, { httpOnly: true });
    return { accessToken: tokens.accessToken };
  }

  @HttpCode(200)
  @Post('/login')
  @UseFilters(new ValidationBodyExceptionFilter())
  @UseFilters(new CommonErrorFilter())
  @UseFilters(new MongoExceptionFilter())
  @UseGuards(LocalStrategyGuard)
  async login(
    @GetUserId() userId: ObjectId,
    @Res({ passthrough: true }) res: Response,
    @Body(new CustomValidationPipe()) loginAuthDto: LoginAuthDto,
  ) {
    const tokens = await this.authService.getRefreshAccessToken(userId);
    res.cookie('accessToken', tokens.refreshToken, { httpOnly: true });
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
  async registrationConfirmation(@Body() code: string) {
    return this.authService.registrationConfirmation(code);
  }

  @HttpCode(204)
  @Post('/logout')
  @UseFilters(new CommonErrorFilter())
  @UseFilters(new MongoExceptionFilter())
  @UseGuards(CookieGuard)
  async logout() {
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
