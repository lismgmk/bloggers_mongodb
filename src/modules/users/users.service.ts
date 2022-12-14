import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { add } from 'date-fns';

import { Model } from 'mongoose';
import { IPaginationResponse } from '../../global-dto/common-interfaces';
import { paginationBuilder, paramsDto } from '../../helpers/pagination-builder';
import { User } from '../../schemas/users.schema';
import { JwtPassService } from '../common-services/jwt-pass-custom/jwt-pass.service';
import { GetAllUsersQueryDto } from './dto/get-all-user-query.dto';
import { IUser } from './dto/user-interfaces';
import {
  ICreatedUserDto,
  IResponseCreateUser,
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

    const newUser = new this.userModel({
      accountData: {
        userName: dto.login,
        email: dto.email,
        passwordHash: hashPassword,
        createdAt: new Date().toISOString(),
        userIp: dto.userIp,
      },
      emailConfirmation: {
        confirmationCode: dto.confirmationCode || new Date().toISOString(),
        expirationDate: add(new Date(), {
          hours: 1,
          minutes: 10,
        }).toISOString(),

        isConfirmed: dto.isConfirmed || false,
        attemptCount: 0,
      },
    });

    try {
      const createdUser = await this.userModel.create(newUser);

      return {
        id: createdUser._id.toString(),
        login: createdUser.accountData.userName,
        email: createdUser.accountData.email,
        createdAt: createdUser.accountData.createdAt,
      } as IResponseCreateUser;
    } catch (e) {
      console.log(e);
    }
  }

  async deleteUserById(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }

  async getAllUsers(
    queryParams: GetAllUsersQueryDto,
  ): Promise<IPaginationResponse<IUser>> {
    const loginPart = new RegExp(queryParams.searchLoginTerm, 'i');
    const emailPart = new RegExp(queryParams.searchEmailTerm, 'i');
    const sortValue = queryParams.sortDirection || 'desc';
    const filterArr = [];
    queryParams.searchLoginTerm &&
      filterArr.push({
        'accountData.userName': loginPart,
      });
    queryParams.searchEmailTerm &&
      filterArr.push({
        'accountData.email': emailPart,
      });
    !queryParams.searchEmailTerm &&
      !queryParams.searchLoginTerm &&
      filterArr.push({});
    try {
      const allUsers: IUser[] = (
        await this.userModel
          .find({ $or: filterArr })
          .sort({
            [`accountData.${
              queryParams.sortBy === 'login' ? 'userName' : queryParams.sortBy
            }`]: sortValue,
          })
          .skip(
            queryParams.pageNumber > 0
              ? (queryParams.pageNumber - 1) * queryParams.pageSize
              : 0,
          )
          .limit(queryParams.pageSize)
          .lean()
      ).map((i) => {
        return {
          id: i._id,
          login: i.accountData.userName,
          createdAt: i.accountData.createdAt,
          email: i.accountData.email,
        };
      });

      const totalCount = await this.userModel.find({ $or: filterArr }).exec();
      const paginationParams: paramsDto = {
        totalCount: totalCount.length,
        pageSize: queryParams.pageSize,
        pageNumber: queryParams.pageNumber,
      };
      return {
        ...paginationBuilder(paginationParams),
        items: allUsers,
      };
    } catch (e) {
      return e;
    }
  }
}
