import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { add } from 'date-fns';

import { Model } from 'mongoose';
import { User } from '../../schemas/users/users.schema';
import { JwtPassService } from '../common-services/jwt-pass-custom/jwt-pass.service';
import { CreateUserMain } from './instance_dto/main_instance/create-user.instance';
import { IUserResponse } from './instance_dto/response_interfaces/all-users.response';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtPassService: JwtPassService,
  ) {}
  async createUser(dto: CreateUserMain) {
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
        isConfirmed: false,
        attemptCount: 0,
      },
      banInfo: {
        isBanned: true,
        banDate: new Date().toISOString(),
        banReason: 'first init',
      },
    });

    try {
      const createdUser = (await this.userModel.create(newUser)) as User;

      return {
        id: createdUser._id.toString(),
        login: createdUser.accountData.userName,
        email: createdUser.accountData.email,
        createdAt: createdUser.accountData.createdAt,
        banInfo: {
          isBanned: createdUser.banInfo.isBanned,
          banDate: createdUser.banInfo.banDate,
          banReason: createdUser.banInfo.banReason,
        },
      } as IUserResponse;
    } catch (e) {
      console.log(e);
    }
  }

  async deleteUserById(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }

  // async getAllUsers(
  //   queryParams: GetAllUsersQueryDto,
  // ): Promise<IPaginationResponse<IUser>> {
  //   const loginPart = new RegExp(queryParams.searchLoginTerm, 'i');
  //   const emailPart = new RegExp(queryParams.searchEmailTerm, 'i');
  //   const sortValue = queryParams.sortDirection || 'desc';
  //   const filterArr = [];
  //   queryParams.searchLoginTerm &&
  //     filterArr.push({
  //       'accountData.userName': loginPart,
  //     });
  //   queryParams.searchEmailTerm &&
  //     filterArr.push({
  //       'accountData.email': emailPart,
  //     });
  //   !queryParams.searchEmailTerm &&
  //     !queryParams.searchLoginTerm &&
  //     filterArr.push({});
  //   try {
  //     const allUsers: IUser[] = (
  //       await this.userModel
  //         .find({ $or: filterArr })
  //         .sort({
  //           [`accountData.${
  //             queryParams.sortBy === 'login' ? 'userName' : queryParams.sortBy
  //           }`]: sortValue,
  //         })
  //         .skip(
  //           queryParams.pageNumber > 0
  //             ? (queryParams.pageNumber - 1) * queryParams.pageSize
  //             : 0,
  //         )
  //         .limit(queryParams.pageSize)
  //         .lean()
  //     ).map((i) => {
  //       return {
  //         id: i._id,
  //         login: i.accountData.userName,
  //         createdAt: i.accountData.createdAt,
  //         email: i.accountData.email,
  //       };
  //     });

  //     const totalCount = await this.userModel.find({ $or: filterArr }).exec();
  //     const paginationParams: paramsDto = {
  //       totalCount: totalCount.length,
  //       pageSize: queryParams.pageSize,
  //       pageNumber: queryParams.pageNumber,
  //     };
  //     return {
  //       ...paginationBuilder(paginationParams),
  //       items: allUsers,
  //     };
  //   } catch (e) {
  //     return e;
  //   }
  // }
}
