import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { add } from 'date-fns';
import { Model } from 'mongoose';
import { paginationBuilder, paramsDto } from 'src/helpers/pagination-builder';
import { v4 } from 'uuid';
import { User } from '../../schemas/users.schema';
import { JwtPassService } from '../jwt-pass/jwt-pass.service';
import { GetAllUsersQueryDto } from './dto/get-all-user-query.dto';
import { IPaginationResponse, IUser } from './dto/user-interfaces';
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

  async getAllUsers(
    queryParams: GetAllUsersQueryDto,
  ): Promise<IPaginationResponse<IUser>> {
    const loginPart = new RegExp(queryParams.searchLoginTerm);
    const emailPart = new RegExp(queryParams.searchEmailTerm);

    const filter = {
      'accountData.userName': loginPart,
      'accountData.email': emailPart,
    };

    const allUsers: IUser[] = (
      await this.userModel
        .find(filter)
        .sort({ [queryParams.sortBy]: queryParams.sortDirection })
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

    const totalCount = await this.userModel.countDocuments().exec();
    const paginationParams: paramsDto = {
      totalCount: totalCount,
      pageSize: queryParams.pageSize,
      pageNumber: queryParams.pageNumber,
    };
    return {
      ...paginationBuilder(paginationParams),
      items: allUsers,
    };
  }
}
