import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { add } from 'date-fns';

import { Model, ObjectId, Types } from 'mongoose';
import { User } from '../../schemas/users/users.schema';
import { JwtPassService } from '../common-services/jwt-pass-custom/jwt-pass.service';
import { CreateConfirmUser } from './instance_dto/dto_transfer/ create-confirm-user';
import { BanUserMain } from './instance_dto/main_instance/ban-user.instance';
import { GetAllUsersMain } from './instance_dto/main_instance/get-all-user.instance';
import { IUserResponse } from './instance_dto/response_interfaces/all-users.response';
import { UsersQueryRepository } from './users.query.repository';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtPassService: JwtPassService,
    private usersQueryRepository: UsersQueryRepository,
  ) {}
  async createUser(dto: CreateConfirmUser) {
    const hashPassword = await this.jwtPassService.createPassBcrypt(
      dto.password,
    );

    const newUser = new this.userModel({
      accountData: {
        userName: dto.login,
        email: dto.email,
        passwordHash: hashPassword,
        createdAt: new Date().toISOString(),
      },
      emailConfirmation: {
        confirmationCode: new Date().toISOString(),
        expirationDate: add(new Date(), {
          hours: 1,
          minutes: 10,
        }).toISOString(),
        isConfirmed: dto.isConfirmed,
        attemptCount: 0,
      },
      banInfoSa: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
      banInfoBlogger: [],
    });

    try {
      const createdUser = (await this.userModel.create(newUser)) as User;
      const user = {
        id: createdUser._id.toString(),
        login: createdUser.accountData.userName,
        email: createdUser.accountData.email,
        createdAt: createdUser.accountData.createdAt,
        banInfo: {
          isBanned: createdUser.banInfoSa.isBanned,
          banDate: createdUser.banInfoSa.banDate,
          banReason: createdUser.banInfoSa.banReason,
        },
      } as IUserResponse;
      return user;
    } catch (e) {
      console.log(e);
    }
  }

  async deleteUserById(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }

  async getAllUsersSa(queryParams: GetAllUsersMain) {
    return this.usersQueryRepository.getAllUsersSaPagination(queryParams);
  }

  async chechUserBan(userId: ObjectId | string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user || user.banInfoSa.isBanned === true) {
      throw new NotFoundException('this user is banned or unexist');
    }
  }

  async getUserById(id: string) {
    return this.userModel.findById(id).exec();
  }
  async changeBlogBanStatus(id: string, banDto: BanUserMain) {
    const filter = {
      'banInfoSa.isBanned': banDto.isBanned,
      'banInfoSa.banReason': banDto.isBanned === true ? banDto.banReason : null,
      'banInfoSa.banDate':
        banDto.isBanned === true ? new Date().toISOString() : null,
    };
    return this.userModel.findByIdAndUpdate(id, filter);
  }
  async changeStatus(id: string, banDto: BanUserMain) {
    const filter = {
      'banInfoSa.isBanned': banDto.isBanned,
      'banInfoSa.banReason': banDto.isBanned === true ? banDto.banReason : null,
      'banInfoSa.banDate':
        banDto.isBanned === true ? new Date().toISOString() : null,
    };
    return this.userModel.findByIdAndUpdate(id, filter);
  }
  async getAllBannedUsers() {
    const result = await this.userModel.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: ['$banInfoSa.isBanned', false],
              },
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
        },
      },
    ]);
    return result.map((el) => new Types.ObjectId(el._id));
  }
}
