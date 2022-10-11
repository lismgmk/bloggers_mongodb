import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlackList } from '../../schemas/black-list.schema';

@Injectable()
export class BlackListRepository {
  constructor(
    @InjectModel(BlackList.name) private blackListModel: Model<BlackList>,
  ) {}
  async addToken(token: string) {
    const doc = await this.blackListModel.create({ tokenValue: token });
    console.log(doc, 'ddddddddddddddddd');
  }

  async checkToken(token: string) {
    return this.blackListModel.findOne({ tokenValue: token }).exec();
  }
}
