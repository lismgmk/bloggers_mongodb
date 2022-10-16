import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { subSeconds } from 'date-fns';
import { Model } from 'mongoose';
import { IpUser } from '../schemas/iPusers.schema';

@Injectable()
export class IpUsersRepository {
  constructor(
    private configService: ConfigService,
    @InjectModel(IpUser.name) private ipUserModel: Model<IpUser>,
  ) {}

  async getAllUsersIp(params: { userIp: string; path: string }) {
    const secondsLimit = this.configService.get<string>('SECONDS_LIMIT');
    // console.log(';;;;;;;');
    // try {
    //   console.log({
    //     userIp: params.userIp,
    //     path: params.path,
    //     createdAt: {
    //       $gte: subSeconds(new Date(), Number(secondsLimit)),
    //     },
    //   });
    //   const getAllUsers = await this.ipUserModel.find({
    //     userIp: params.userIp,
    //     path: params.path,
    //     createdAt: {
    //       $gte: subSeconds(new Date(), Number(secondsLimit)),
    //     },
    //   });
    //   // .exec();
    //   console.log(getAllUsers, 'allusers');
    //   return getAllUsers;
    // } catch (e) {
    //   throw new Error();
    // }

    return await this.ipUserModel
      .find({
        userIp: params.userIp,
        path: params.path,
        createdAt: {
          $gte: subSeconds(new Date(), Number(secondsLimit)),
        },
      })
      .exec();
  }
  async createUsersIp(params: { userIp: string; path: string }) {
    const newIpUser = new this.ipUserModel({
      createdAt: new Date(),
      userIp: params.userIp,
      path: params.path,
    });
    console.log('llllllllllllllllllll');
    return await this.ipUserModel.create(newIpUser);
  }
  async usersLoginDiffIp(params: { userIp: string; filter: { path: string } }) {
    const val = await this.ipUserModel
      .distinct(params.userIp, params.filter)
      .exec();
    console.log(val, 'ddddddd');
    return val;
    // return await this.ipUserModel.distinct(params.userIp, params.filter).exec();
  }
}
