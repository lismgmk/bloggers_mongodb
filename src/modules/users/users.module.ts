import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerGuard } from '@nestjs/throttler';
import { isMongoObjIdValidator } from '../../dto-validator/is-mongid-obj';
import { UnExistValidator } from '../../dto-validator/is-unexist-user';
import { UserSchema, User } from '../../schemas/users.schema';
import { JwtPassService } from '../jwt-pass/jwt-pass.service';
import { BasicStrategy } from '../../strategyes/auth-basic.strategy';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { IfExistUserDropErrorValidator } from 'src/dto-validator/if-exist-user-drop-error';

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
    UnExistValidator,
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
