import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { LikeStatusEnum } from '../../global-dto/like-status.dto';
import { Like } from '../../schemas/likes.schema';

export interface ILikeInfo {
  postId: string | null | ObjectId;
  commentId: string | null | ObjectId;
  status: keyof typeof LikeStatusEnum;
  userId: ObjectId;
  login: string;
}

@Injectable()
export class LikesService {
  constructor(@InjectModel(Like.name) private likeModel: Model<Like>) {}

  async upDateLikesInfo(dto: ILikeInfo) {
    const filter = {
      userId: dto.userId,
      postId: dto.postId,
      commentId: dto.commentId,
      login: dto.login,
    };
    const update = { status: dto.status, createdAt: new Date().toISOString() };
    try {
      return this.likeModel.findOneAndUpdate(filter, update, {
        new: true,
        upsert: true,
      });
    } catch (e) {
      console.log(e);
    }
  }
}
