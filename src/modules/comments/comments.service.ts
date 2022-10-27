import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LikeInfoRequest } from 'global-dto/like-info.request';
import { LikesService } from 'modules/likes/likes.service';
import { Model } from 'mongoose';
import { Comments } from 'schemas/comments.schema';
import { ICreateComment } from './dto/comments-interfaces';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comments.name) private commentModel: Model<Comments>,
    private likesService: LikesService,
  ) {}

  async createComment(dto: ICreateComment) {
    const newComment = new this.commentModel({
      postId: dto.postId,
      userId: dto.userId,
      content: dto.content,
      userLogin: dto.userLogin,
      createdAt: new Date(),
    });
    const createdComment = (await this.commentModel.create(
      newComment,
    )) as Comments;

    const extendedLikesInfo: LikeInfoRequest = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
    };
    return {
      id: createdComment._id,
      content: createdComment.content,
      userId: createdComment.userId,
      userLogin: createdComment.userLogin,
      createdAt: createdComment.createdAt,
      extendedLikesInfo,
    };
  }
}
