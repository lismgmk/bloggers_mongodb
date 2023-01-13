import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlackList } from '../../schemas/black-list.schema';
import { Blog } from '../../schemas/blog.schema';
import { Comments } from '../../schemas/comments.schema';
import { IpUser } from '../../schemas/iPusers.schema';
import { Like } from '../../schemas/likes.schema';
import { Posts } from '../../schemas/posts.schema';
import { User } from '../../schemas/users/users.schema';

@Injectable()
export class TestingService {
  constructor(
    @InjectModel(Comments.name) private commentModel: Model<Comments>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Like.name) private likeModel: Model<Like>,
    @InjectModel(Blog.name) private blogModel: Model<Blog>,
    @InjectModel(Posts.name) private postModel: Model<Posts>,
    @InjectModel(BlackList.name) private blackListModel: Model<BlackList>,
    @InjectModel(IpUser.name) private ipUserModel: Model<IpUser>,
  ) {}

  async deleteAllData() {
    await this.commentModel.deleteMany({});
    await this.userModel.deleteMany({});
    await this.likeModel.deleteMany({});
    await this.blogModel.deleteMany({});
    await this.postModel.deleteMany({});
    await this.blackListModel.deleteMany({});
    await this.ipUserModel.deleteMany({});
    return;
  }
}
