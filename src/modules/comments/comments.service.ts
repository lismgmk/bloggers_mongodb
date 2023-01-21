import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { LikeInfoRequest } from '../../global-dto/like-info.request';
import { LikeStatusEnum } from '../../global-dto/like-status.dto';
import { CommentsMain } from '../../schemas/comments/comments.instance';
import { Comments } from '../../schemas/comments/comments.schema';
import { User } from '../../schemas/users/users.schema';
import { LikesService } from '../likes/likes.service';
import { UsersService } from '../users/users.service';
import { CommentsQueryRepository } from './comments.query.repository';
import { ICreateComment } from './dto/comments-interfaces';
import { GetAllCommentsDto } from './dto/get-all-comments.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comments.name) private commentModel: Model<Comments>,
    private likesService: LikesService,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private usersService: UsersService,
  ) {}

  async createComment(dto: ICreateComment) {
    const newComment = new this.commentModel({
      postId: dto.postId,
      userId: dto.userId,
      content: dto.content,
      userLogin: dto.userLogin,
      createdAt: new Date().toISOString(),
    });
    const createdComment = (await this.commentModel.create(
      newComment,
    )) as Comments;

    const likesInfo: LikeInfoRequest = {
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
      likesInfo,
    };
  }

  async getCommentsForPostId(
    queryParams: GetAllCommentsDto,
    postId: string,
    userId: string,
  ) {
    try {
      // const f = await this.commentsQueryRepository.queryAllCommentsPagination(
      //   queryParams,
      //   postId,
      //   userId,
      // );
      // console.log(f, 'dddd');
      const bannedUsers = await this.usersService.getAllBannedUsers();
      return await this.commentsQueryRepository.queryAllCommentsPagination(
        queryParams,
        postId,
        userId,
        bannedUsers,
      );
    } catch (e) {
      console.log(e);
    }
  }
  async getCommentById(id: string | ObjectId): Promise<Comments> {
    return this.commentModel.findById(id).exec();
  }
  async addLikeStatuseComment(
    user: User,
    likeStatus: keyof typeof LikeStatusEnum,
    commentId: string | ObjectId,
  ) {
    const currentComment = await this.getCommentById(commentId);
    if (!currentComment) {
      throw new NotFoundException();
    }

    await this.likesService.upDateLikesInfo({
      postId: null,
      commentId,
      status: likeStatus,
      userId: user._id,
      login: user.accountData.userName,
    });
  }
  async changeComment(id: string, content: string, userId: string) {
    const comment = (await this.commentModel.findById(id)) as Comments;
    if (!comment) {
      throw new NotFoundException();
    }
    if (!comment.userId.equals(userId)) {
      throw new ForbiddenException();
    }
    comment.content = content;
    comment.save();
  }

  async deleteCommentById(id: string | ObjectId, userId: string) {
    const comment = await this.getCommentById(id);
    if (!comment) {
      throw new NotFoundException();
    }
    if (!comment.userId.equals(userId)) {
      throw new ForbiddenException();
    }
    return this.commentModel.findByIdAndDelete(id);
  }

  async getCommentByIdWithLikes(id: string, userId: string) {
    const comment = await this.getCommentById(id);
    await this.usersService.chechUserBan(comment.userId.toString());
    if (!comment) {
      throw new NotFoundException();
    }
    return this.commentsQueryRepository.queryCommentById(id, userId);
  }
}
