import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerGuard } from '@nestjs/throttler';
import { isMongoObjIdValidator } from '../../dto-validator/is-mongid-obj';
import { UserSchema, User } from '../../schemas/users.schema';
import { JwtPassService } from '../common-services/jwt-pass/jwt-pass.service';
import { BasicStrategy } from '../../strategyes/auth-basic.strategy';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { IfNotFoundUserIdDropError } from 'dto-validator/if-not-found-user-id-drop-error';
import { IfExistUserDropErrorValidator } from 'dto-validator/if-exist-user-drop-error';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
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
