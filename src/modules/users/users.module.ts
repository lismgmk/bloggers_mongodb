import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { IfExistUserDropErrorValidator } from '../../dto-validator/if-exist-user-drop-error';
import { IfNotFoundUserIdDropError } from '../../dto-validator/if-not-found-user-id-drop-error';
import { isMongoObjIdValidator } from '../../dto-validator/is-mongid-obj';
import { User, UserSchema } from '../../schemas/users.schema';
import { BasicStrategy } from '../../strategyes/auth-basic.strategy';
import { JwtPassService } from '../common-services/jwt-pass-custom/jwt-pass.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 5,
    }),
  ],
  controllers: [UsersController],

  providers: [
    JwtService,
    UsersService,
    BasicStrategy,
    IfExistUserDropErrorValidator,
    IfNotFoundUserIdDropError,
    isMongoObjIdValidator,
    UsersRepository,
    JwtPassService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class UsersModule {}
