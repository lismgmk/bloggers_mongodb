import { Controller, Get, HttpCode } from '@nestjs/common';

@Controller('')
export class AppContoller {
  @Get()
  @HttpCode(200)
  async startPoint() {
    return 'Use this API';
  }
}
