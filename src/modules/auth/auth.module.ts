import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { IsExpired } from '../../dto-validator/check-expiration-code';
import { IpUsersRepository } from '../../repositotyes/ip-user.repository';
import {
  BanInfoBlogger,
  BanInfoBloggerSchema,
} from '../../schemas/banBlogger/ban-blogger.schema';
import { BlackList, BlackListSchema } from '../../schemas/black-list.schema';
import { Devices, DevicesSchema } from '../../schemas/device.schema';
import { IpUser, IpUserSchema } from '../../schemas/iPusers.schema';
import { User, UserSchema } from '../../schemas/users/users.schema';
import { JwtStrategy } from '../../strategyes/jwt.strategy';
import { LocalStrategy } from '../../strategyes/local.strategy';
import { JwtPassService } from '../common-services/jwt-pass-custom/jwt-pass.service';
import { SecurityService } from '../security/security.service';
import { UsersQueryRepository } from '../users/users.query.repository';
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
    // ThrottlerModule.forRoot({
    //   ttl: 10,
    //   limit: 5,
    // }),
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
      { name: Devices.name, schema: DevicesSchema },
      { name: BanInfoBlogger.name, schema: BanInfoBloggerSchema },
    ]),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [
    SecurityService,
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
    IsExpired,
    UsersQueryRepository,
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class AuthModule {}
