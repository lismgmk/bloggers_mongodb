import { likeStatusType } from './../likes/dto/like-interfaces';
import { Blog } from 'schemas/blog.schema';
import { BlogsService } from './../blogs/blogs.service';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Posts } from 'schemas/posts.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { GetAllPostsdDto } from './dto/get-all-posts.dto';
import { LikeInfoRequest } from 'global-dto/like-info.request';
import { User } from 'schemas/users.schema';
import { LikesService } from 'modules/likes/likes.service';
import { LikeStatusEnum } from 'global-dto/like-status.dto';
import { IPostsRequest } from './dto/all-posts-response';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Posts.name) private postModel: Model<Posts>,
    private blogsService: BlogsService,
    private likesService: LikesService,
  ) {}
  async getAllPosts(
    queryParams: GetAllPostsdDto, // : Promise<IPaginationResponse<Post>>
  ) {
    const sortField = queryParams.sortBy;
    const sortValue = queryParams.sortDirection === 'desc' ? -1 : 1;
    const myStatus = 'None';
    return (await this.postModel
      .aggregate([
        {
          $sort: {
            [sortField]: sortValue,
          },
        },
        {
          $skip:
            queryParams.pageNumber > 0
              ? (queryParams.pageNumber - 1) * queryParams.pageSize
              : 0,
        },
        { $limit: queryParams.pageSize },
        {
          $project: {
            _id: 0,
            id: '$_id',
            title: '$title',
            shortDescription: '$shortDescription',
            content: '$content',
            blogId: '$blogId',
            blogName: '$blogName',
            createdAt: '$createdAt',
          },
        },
        {
          $lookup: {
            from: 'likes',
            localField: 'id',
            foreignField: 'postId',
            as: 'extendedLikesInfo.newestLikes',
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$status', 'Dislike'] }],
                  },
                },
              },
              { $sort: { createdAt: 1 } },
              { $limit: 3 },
              {
                $project: {
                  _id: 0,
                  addedAt: '$createdAt',
                  userId: '$blogId',
                  login: '$login',
                },
              },
            ],
          },
        },

        {
          $lookup: {
            from: 'likes',
            localField: 'id',
            foreignField: 'postId',
            as: 'extendedLikesInfo.likeCount',
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$status', 'Like'] }],
                  },
                },
              },
            ],
          },
        },
        {
          $set: {
            'extendedLikesInfo.likeCount': {
              $size: '$extendedLikesInfo.likeCount',
            },
          },
        },
        {
          $lookup: {
            from: 'likes',
            localField: 'id',
            foreignField: 'postId',
            as: 'extendedLikesInfo.dislikeCount',
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$status', 'Dislike'] }],
                  },
                },
              },
            ],
          },
        },
        {
          $set: {
            'extendedLikesInfo.dislikeCount': {
              $size: '$extendedLikesInfo.dislikeCount',
            },
            'extendedLikesInfo.myStatus': myStatus,
          },
        },
      ])
      .exec()) as IPostsRequest;
  }

  async getPostById(id: string | ObjectId) {
    return await this.postModel.findById(id).exec();
  }

  async addLikeStatusePost(
    user: User,
    likeStatus: keyof typeof LikeStatusEnum,
    postId: string | ObjectId,
  ) {
    const currentPost = await this.getPostById(postId);
    if (!currentPost) {
      throw new NotFoundException();
    }
    await this.likesService.upDateLikesInfo({
      postId,
      commentId: null,
      status: likeStatus,
      userId: user._id,
      login: user.accountData.userName,
    });
  }

  async createPost(dto: CreatePostDto) {
    const currentBlog = (await this.blogsService.getBlogById(
      dto.blogId,
    )) as Blog;
    if (!currentBlog) {
      throw new BadRequestException({
        message: { message: 'blog does not found', field: 'blogId' },
      });
    }
    const newPost = new this.postModel({
      title: dto.title,
      content: dto.content,
      shortDescription: dto.shortDescription,
      bloggerId: dto.blogId,
      createdAt: new Date(),
    });
    const createdPost = (await this.postModel.create(newPost)) as Posts;

    const extendedLikesInfo: LikeInfoRequest = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
      newestLikes: [],
    };
    return {
      id: createdPost._id,
      title: createdPost.title,
      shortDescription: createdPost.shortDescription,
      content: createdPost.content,
      blogId: currentBlog._id,
      blogName: currentBlog.name,
      createdAt: createdPost.createdAt,
      extendedLikesInfo,
    };
  }
}
