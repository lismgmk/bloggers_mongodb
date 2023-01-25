import { Types } from 'mongoose';
import { BanInfoMain } from '../users/users.instance';

export class BanInfoBloggerMain extends BanInfoMain {
  blogId: Types.ObjectId;
  userId: Types.ObjectId;
  login: string;
}
