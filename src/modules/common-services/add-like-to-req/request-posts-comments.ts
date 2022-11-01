import { InjectModel } from '@nestjs/mongoose';
import { likeStatusType } from 'modules/likes/dto/like-interfaces';
import { Model, Types } from 'mongoose';
import { Like } from 'schemas/likes.schema';

export interface IPostsRequest {
  _id?: Types.ObjectId;
  id?: Types.ObjectId;
  shortDescription?: string;
  content?: string | null;
  title?: string | null;
  bloggerId: any;
  bloggerName: string;
  addedAt: Date;
  extendedLikesInfo?: {
    dislikesCount: number;
    likesCount: number;
    myStatus: likeStatusType;
    newestLikes: { addedAt: Date; userId: Types.ObjectId; login: string }[];
  };
}
interface ICommentsRequest {
  _id?: Types.ObjectId;
  id?: Types.ObjectId;
  content: string;
  userId: any;
  postId?: Types.ObjectId;
  userLogin: string;
  addedAt: Date;
  likesInfo?: {
    dislikesCount: number;
    likesCount: number;
    myStatus: likeStatusType;
  };
}
export class RequestBuilder {
  constructor(@InjectModel(Like.name) private likeModel: Model<Like>) {}

  async commentObj(comment: ICommentsRequest, userStatus: likeStatusType) {}
  async postObj(
    post: IPostsRequest | null,
    userStatus: likeStatusType = 'None',
  ) {}
}
