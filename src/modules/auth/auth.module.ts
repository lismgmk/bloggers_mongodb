import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerGuard } from '@nestjs/throttler';
import { IpUsersRepository } from '../../repositotyes/ip-user.repository';
import { BlackList, BlackListSchema } from '../../schemas/black-list.schema';
import { IpUser, IpUserSchema } from '../../schemas/iPusers.schema';
import { User, UserSchema } from '../../schemas/users.schema';
import { JwtStrategy } from '../../strategyes/jwt.strategy';
import { LocalStrategy } from '../../strategyes/local.strategy';
import { JwtPassService } from '../jwt-pass/jwt-pass.service';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BlackListRepository } from './black-list.repository';
import { RegistrationHandler } from './commands/handlers/registration.handler';
import { SendEmailHandler } from './events/handlers/send-email.handler';

@Module({
  imports: [
    CqrsModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: IpUser.name, schema: IpUserSchema },
      { name: BlackList.name, schema: BlackListSchema },
    ]),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    BlackListRepository,
    IpUsersRepository,
    UsersRepository,
    JwtPassService,
    UsersService,
    JwtStrategy,
    RegistrationHandler,
    SendEmailHandler,
    LocalStrategy,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AuthModule {}
