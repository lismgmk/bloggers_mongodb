// if (!process.env.IS_TS_NODE) {
//   require('module-alias/register');
// }
import 'module-alias/register';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';
import { MongoExceptionFilter } from './exceptions/mongoose-exception-filter';
import { AppModule } from './modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.enableCors();
  app.useGlobalFilters(new MongoExceptionFilter());
  app.use(cookieParser());
  await app.listen(process.env.PORT || 5000);
}

bootstrap();
