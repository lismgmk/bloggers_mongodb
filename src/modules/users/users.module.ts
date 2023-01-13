import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { IfConfirmedUserDropErrorValidator } from '../../dto-validator/if-confirmed-user-drop-error';
import { IfEpsentUserDropErrorValidator } from '../../dto-validator/if-epsent-user-drop-error';
import { IfExistUserDropErrorValidator } from '../../dto-validator/if-exist-user-drop-error';
import { IfNotFoundUserIdDropError } from '../../dto-validator/if-not-found-user-id-drop-error';
import { User, UserSchema } from '../../schemas/users/users.schema';
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
  ],
  controllers: [UsersController],

  providers: [
    JwtService,
    UsersService,
    BasicStrategy,
    IfExistUserDropErrorValidator,
    IfEpsentUserDropErrorValidator,
    IfNotFoundUserIdDropError,
    IfConfirmedUserDropErrorValidator,
    UsersRepository,
    JwtPassService,
  ],
})
export class UsersModule {}
