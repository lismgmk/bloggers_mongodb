import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { User } from '../../schemas/users/users.schema';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async getUserByLogin(login: string) {
    const user = await this.userModel.find({
      'accountData.userName': login,
    });
    return user[0];
  }
  async getUserByEmail(email: string) {
    const user = await this.userModel.find({
      'accountData.email': { $eq: email },
    });
    return user[0];
  }
  async getUserById(id: string | ObjectId) {
    return this.userModel.findById(id).exec();
  }
}
