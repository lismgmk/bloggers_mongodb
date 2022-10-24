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

  async commentObj(comment: ICommentsRequest, userStatus: likeStatusType) {
    // let result: ICommentsRequest;
    // result.userLogin = comment.userId.accountData.userName;
    // result.userId = comment.userId._id;
    // result.id = comment._id;
    // delete comment._id;
    // delete comment.postId;
    // const dislikesCount = await Likes.find({
    //   commentId: this.comment.id,
    //   myStatus: 'Dislike',
    // }).exec();
    // const likesCount = await Likes.find({
    //   commentId: this.comment.id,
    //   myStatus: 'Like',
    // }).exec();
    // this.comment.likesInfo = {
    //   dislikesCount: dislikesCount.length,
    //   likesCount: likesCount.length,
    //   myStatus: this.userStatus || 'None',
    // };
    // return this.comment;
  }
  async postObj(
    post: IPostsRequest | null,
    userStatus: likeStatusType = 'None',
  ) {
    // if (this.post) {
    //   this.post.bloggerName = this.post.bloggerId.name;
    //   this.post.bloggerId = this.post.bloggerId!._id;
    //   this.post.id = this.post._id;
    //   delete this.post._id;
    //   const dislikesCount = await Likes.find({
    //     postId: this.post.id,
    //     myStatus: 'Dislike',
    //   }).exec();
    //   const likesCount = await Likes.find({
    //     postId: this.post.id,
    //     myStatus: 'Like',
    //   })
    //     .sort({ addedAt: -1 })
    //     .exec();
    //   const newestLikes = likesCount.slice(0, 3).map((el) => {
    //     return {
    //       addedAt: el.addedAt,
    //       userId: el.userId,
    //       login: el.login,
    //     };
    //   });
    //   this.post.extendedLikesInfo = {
    //     dislikesCount: dislikesCount.length,
    //     likesCount: likesCount.length,
    //     myStatus: this.userStatus,
    //     newestLikes,
    //   };
    // }
    // return this.post;
  }
}
