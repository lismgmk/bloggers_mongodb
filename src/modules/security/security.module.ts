import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { BlackList, BlackListSchema } from '../../schemas/black-list.schema';
import { Devices, DevicesSchema } from '../../schemas/device.schema';
import { User, UserSchema } from '../../schemas/users.schema';
import { BlackListRepository } from '../auth/black-list.repository';
import { JwtPassService } from '../common-services/jwt-pass-custom/jwt-pass.service';
import { UsersRepository } from '../users/users.repository';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';

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
