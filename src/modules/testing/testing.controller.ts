import { Controller, Delete, HttpCode, UseFilters } from '@nestjs/common';
import { MongoExceptionFilter } from 'exceptions/mongoose-exception-filter';
import { TestingService } from './testing.service';

@Controller('testing/all-data')
export class TestingController {
  constructor(private readonly testingService: TestingService) {}

  @Delete()
  @HttpCode(204)
  @UseFilters(new MongoExceptionFilter())
  async deleteAllData() {
    return await this.testingService.deleteAllData();
  }
}
