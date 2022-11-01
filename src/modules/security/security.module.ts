import { ConfigModule } from '@nestjs/config';
import { Devices, DevicesSchema } from './../../schemas/device.schema';
import { Module } from '@nestjs/common';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'schemas/users.schema';
import { BlackListRepository } from 'modules/auth/black-list.repository';
import { JwtPassService } from 'modules/common-services/jwt-pass/jwt-pass.service';
import { UsersRepository } from 'modules/users/users.repository';
import { JwtService } from '@nestjs/jwt';
import { BlackList, BlackListSchema } from 'schemas/black-list.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forFeature([
      { name: Devices.name, schema: DevicesSchema },
      { name: User.name, schema: UserSchema },
      { name: BlackList.name, schema: BlackListSchema },
    ]),
  ],
  controllers: [SecurityController],
  providers: [
    SecurityService,
    UsersRepository,
    JwtPassService,
    BlackListRepository,
    JwtService,
  ],
})
export class SecurityModule {}
