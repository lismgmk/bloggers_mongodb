import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { add } from 'date-fns';
import { Model } from 'mongoose';
import { v4 } from 'uuid';
import { User } from '../../schemas/users.schema';
import { JwtPassService } from '../jwt-pass/jwt-pass.service';
import {
  IResponseCreateUser,
  ICreatedUserDto,
} from './dto/user-interfaces.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtPassService: JwtPassService,
  ) {}
  async createUser(dto: ICreatedUserDto) {
    const hashPassword = await this.jwtPassService.createPassBcrypt(
      dto.password,
    );

    const confirmationCode = v4();
    const newUser = new this.userModel({
      accountData: {
        userName: dto.login,
        email: dto.email,
        passwordHash: hashPassword,
        createdAt: new Date(),
        userIp: dto.userIp,
      },
      emailConfirmation: {
        confirmationCode,
        expirationDate: add(new Date(), {
          hours: 1,
          minutes: 10,
        }),
        isConfirmed: true,
        attemptCount: 0,
      },
    });
    const createdUser = await this.userModel.create(newUser);
    return {
      id: createdUser._id.toString(),
      login: createdUser.accountData.userName,
      email: createdUser.accountData.email,
      createdAt: createdUser.accountData.createdAt,
    } as IResponseCreateUser;
  }
  async deleteUserById(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }
}
