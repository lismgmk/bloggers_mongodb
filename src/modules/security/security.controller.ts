import {
  Controller,
  Get,
  HttpCode,
  UsePipes,
  ValidationPipe,
  UseFilters,
  UseGuards,
  Delete,
  Param,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { GetDeviceId } from '../../decorators/get-device-id.decorator';
import { GetUserId } from '../../decorators/get-user-id.decorator';
import { MongoExceptionFilter } from '../../exceptions/mongoose-exception-filter';
import { CookieGuard } from '../../guards/cookie.guard';
import { ParamIdValidationPipe } from '../../pipes/param-id-validation.pipe';
import { SecurityService } from './security.service';

@Controller('security/devices')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Get()
  @HttpCode(200)
  @SkipThrottle()
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseFilters(new MongoExceptionFilter())
  @UseGuards(CookieGuard)
  async getAllPosts(
    @GetUserId()
    userId: string,
  ) {
    return await this.securityService.getAllDevices(userId);
  }

  @Delete()
  @HttpCode(204)
  @SkipThrottle()
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseFilters(new MongoExceptionFilter())
  @UseGuards(CookieGuard)
  async deleteAllExcludeCurrent(
    @GetUserId()
    userId: string,
    @GetDeviceId()
    deviceId: string,
  ) {
    return await this.securityService.deleteAllExcludeCurrent(userId, deviceId);
  }

  @Delete(':id')
  @HttpCode(204)
  @SkipThrottle()
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseFilters(new MongoExceptionFilter())
  @UseGuards(CookieGuard)
  async deleteCurrentDevice(
    @Param('id', ParamIdValidationPipe)
    deviceId: string,
    @GetUserId()
    userId: string,
  ) {
    return await this.securityService.deleteCurrentDevice(deviceId, userId);
  }
}
