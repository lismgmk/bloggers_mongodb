import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { IPaginationResponse } from '../../global-dto/common-interfaces';
import { getSortDirection } from '../../helpers/get-sort-direction';
import { paginationDefaultBuilder } from '../../helpers/pagination-default-builder';
import { Comments } from '../../schemas/comments/comments.schema';
import { pageNumber } from '../../test-params/test-values';
import { UsersService } from '../users/users.service';
import { ICommentsRequest } from './dto/all-comments-response';
import {
  IAgregateCommentById,
  IAgregateComments,
} from './instance_dto/dto_transfer/IAgregate';
import { GetAllCommentsMain } from './instance_dto/main_instance/get-all-comments.instance';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comments.name) private commentModel: Model<Comments>,
    private usersService: UsersService,
  ) {}

  async getAllCommentsForAllPostsForAllUsersBlog(
    queryParams: GetAllCommentsMain,
    userId: string,
    blogs: Types.ObjectId[],
  ) {
    const bannedUsers = await this.usersService.getAllBannedUsers();
    const sortField = queryParams.sortBy;
    const sortValue = getSortDirection(queryParams.sortDirection);
    const singleCondition = {
      $expr: {
        $and: [{ $in: ['$userId', bannedUsers] }, { $in: ['$blogId', blogs] }],
      },
    };
    return this._agregateFindCommentPostsForUser({
      queryParams: queryParams,
      singleCondition,
      sortField,
      sortValue,
      unset: ['items.total', '_id', 'items.blogId', 'items.postId'],
      userId,
      bannedUsers,
    });
  }

  async queryAllCommentsPagination(
    queryParams: GetAllCommentsMain,
    postId: string = null,
    userId: string,
    bannedUsers: Types.ObjectId[],
  ) {
    const sortField = queryParams.sortBy;
    const sortValue = getSortDirection(queryParams.sortDirection);
    return this._agregateFindComments({
      queryParams: queryParams,
      singleCondition: { postId: new mongoose.Types.ObjectId(postId) },
      sortField,
      sortValue,
      unset: ['items.total', '_id', 'items.blogId', 'items.postId'],
      userId,
      bannedUsers,
    });
  }

  async queryCommentById(id: string, bannedUsers: Types.ObjectId[]) {
    const commentId = new mongoose.Types.ObjectId(id);
    return this._agregateFindCommentById({
      singleCondition: { _id: commentId },
      bannedUsers,
    });
  }

  async _agregateFindComments(dto: IAgregateComments) {
    const skipParam =
      dto.queryParams.pageNumber > 0
        ? (dto.queryParams.pageNumber - 1) * dto.queryParams.pageSize
        : 0;

    console.log('!!!!skip param', skipParam);

    const result = (
      await this.commentModel
        .aggregate([
          {
            $match: dto.singleCondition,
          },
          {
            $sort: {
              [dto.sortField]: dto.sortValue,
            },
          },
          { $setWindowFields: { output: { totalCount: { $count: {} } } } },
          {
            $skip: skipParam,
          },
          { $limit: dto.queryParams.pageSize },
          {
            $project: {
              _id: 0,
              total: '$totalCount',
              id: '$_id',
              content: '$content',
              userId: '$userId',
              userLogin: '$userLogin',
              createdAt: '$createdAt',
            },
          },

          {
            $lookup: {
              from: 'likes',
              localField: 'id',
              foreignField: 'commentId',
              as: 'likesInfo.likesCount',
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$status', 'Like'] },
                        { $in: ['$userId', dto.bannedUsers] },
                      ],
                    },
                  },
                },
              ],
            },
          },
          {
            $set: {
              'likesInfo.likesCount': {
                $size: '$likesInfo.likesCount',
              },
            },
          },
          {
            $lookup: {
              from: 'likes',
              localField: 'id',
              foreignField: 'commentId',
              as: 'likesInfo.myStatus',
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$userId', dto.userId] },
                        { $in: ['$userId', dto.bannedUsers] },
                      ],
                    },
                  },
                },
              ],
            },
          },
          {
            $set: {
              'likesInfo.myStatus': {
                $ifNull: [
                  {
                    $first: '$likesInfo.myStatus.status',
                  },
                  'None',
                ],
              },
            },
          },
          {
            $lookup: {
              from: 'likes',
              localField: 'id',
              foreignField: 'commentId',
              as: 'likesInfo.dislikesCount',
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$status', 'Dislike'] },
                        { $in: ['$userId', dto.bannedUsers] },
                      ],
                    },
                  },
                },
              ],
            },
          },
          {
            $set: {
              'likesInfo.dislikesCount': {
                $size: '$likesInfo.dislikesCount',
              },
            },
          },

          {
            $group: {
              _id: dto.sortField,
              page: { $first: dto.queryParams.pageNumber },
              pageSize: { $first: dto.queryParams.pageSize },
              totalCount: { $first: '$$ROOT.total' },
              pagesCount: {
                $first: {
                  $ceil: [
                    { $divide: ['$$ROOT.total', dto.queryParams.pageSize] },
                  ],
                },
              },
              items: { $push: '$$ROOT' },
            },
          },
          {
            $unset: dto.unset,
          },
        ])
        .exec()
    )[0] as IPaginationResponse<ICommentsRequest[]>;
    return (
      result ||
      paginationDefaultBuilder({
        pageSize: dto.queryParams.pageSize,
        pageNumber: dto.queryParams.pageNumber,
      })
    );
  }

  async _agregateFindCommentPostsForUser(dto: IAgregateComments) {
    const result = (
      await this.commentModel
        .aggregate([
          {
            $match: dto.singleCondition,
          },
          {
            $sort: {
              [dto.sortField]: dto.sortValue,
            },
          },
          { $setWindowFields: { output: { totalCount: { $count: {} } } } },
          {
            $skip:
              dto.queryParams.pageNumber > 0
                ? (dto.queryParams.pageNumber - 1) * dto.queryParams.pageSize
                : 0,
          },
          { $limit: dto.queryParams.pageSize },
          {
            $project: {
              _id: 0,
              total: '$totalCount',
              id: '$_id',
              content: '$content',
              createdAt: '$createdAt',
              commentatorInfo: {
                userId: '$userId',
                userLogin: '$userLogin',
              },
              postId: '$postId',
              blogId: '$blogId',
            },
          },
          {
            $lookup: {
              from: 'posts',
              localField: 'postId',
              foreignField: '_id',
              as: 'postInfo',
              pipeline: [
                {
                  $lookup: {
                    from: 'blogs',
                    localField: 'blogId',
                    foreignField: '_id',
                    as: 'blog',
                    pipeline: [],
                  },
                },

                {
                  $project: {
                    _id: 0,
                    id: '$_id',
                    title: '$title',
                    blogId: '$blogId',
                    blogName: { $first: '$blog' },
                  },
                },
                { $set: { blogName: '$blogName.name' } },
              ],
            },
          },
          {
            $set: {
              postInfo: { $first: '$postInfo' },
            },
          },
          {
            $lookup: {
              from: 'likes',
              localField: 'id',
              foreignField: 'commentId',
              as: 'likesInfo.likesCount',
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$status', 'Like'] },
                        { $in: ['$userId', dto.bannedUsers] },
                      ],
                    },
                  },
                },
              ],
            },
          },
          {
            $set: {
              'likesInfo.likesCount': {
                $size: '$likesInfo.likesCount',
              },
            },
          },
          {
            $lookup: {
              from: 'likes',
              localField: 'id',
              foreignField: 'commentId',
              as: 'likesInfo.myStatus',
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$userId', dto.userId] },
                        { $in: ['$userId', dto.bannedUsers] },
                      ],
                    },
                  },
                },
              ],
            },
          },
          {
            $set: {
              'likesInfo.myStatus': {
                $ifNull: [
                  {
                    $first: '$likesInfo.myStatus.status',
                  },
                  'None',
                ],
              },
            },
          },
          {
            $lookup: {
              from: 'likes',
              localField: 'id',
              foreignField: 'commentId',
              as: 'likesInfo.dislikesCount',
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$status', 'Dislike'] },
                        { $in: ['$userId', dto.bannedUsers] },
                      ],
                    },
                  },
                },
              ],
            },
          },
          {
            $set: {
              'likesInfo.dislikesCount': {
                $size: '$likesInfo.dislikesCount',
              },
            },
          },

          {
            $group: {
              _id: dto.sortField,
              page: { $first: pageNumber },
              pageSize: { $first: dto.queryParams.pageSize },
              totalCount: { $first: '$$ROOT.total' },
              pagesCount: {
                $first: {
                  $ceil: [
                    { $divide: ['$$ROOT.total', dto.queryParams.pageSize] },
                  ],
                },
              },
              items: { $push: '$$ROOT' },
            },
          },
          {
            $unset: dto.unset,
          },
        ])
        .exec()
    )[0] as IPaginationResponse<ICommentsRequest[]>;
    return (
      result ||
      paginationDefaultBuilder({
        pageSize: dto.queryParams.pageSize,
        pageNumber: dto.queryParams.pageNumber,
      })
    );
  }

  async _agregateFindCommentById(dto: IAgregateCommentById) {
    return (
      await this.commentModel
        .aggregate([
          {
            $match: dto.singleCondition,
          },

          {
            $project: {
              _id: 0,
              total: '$totalCount',
              id: '$_id',
              content: '$content',
              userId: '$userId',
              userLogin: '$userLogin',
              createdAt: '$createdAt',
            },
          },
          {
            $match: {
              userId: {
                $in: dto.bannedUsers,
              },
            },
          },
          {
            $lookup: {
              from: 'likes',
              localField: 'id',
              foreignField: 'commentId',
              as: 'likesInfo.likesCount',
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$status', 'Like'] },
                        { $in: ['$userId', dto.bannedUsers] },
                      ],
                    },
                  },
                },
              ],
            },
          },
          {
            $set: {
              'likesInfo.likesCount': {
                $size: '$likesInfo.likesCount',
              },
            },
          },
          {
            $set: {
              'likesInfo.myStatus': 'None',
            },
          },
          {
            $lookup: {
              from: 'likes',
              localField: 'id',
              foreignField: 'commentId',
              as: 'likesInfo.dislikesCount',
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$status', 'Dislike'] },
                        { $in: ['$userId', dto.bannedUsers] },
                      ],
                    },
                  },
                },
              ],
            },
          },
          {
            $set: {
              'likesInfo.dislikesCount': {
                $size: '$likesInfo.dislikesCount',
              },
            },
          },
          { $unset: ['blogId'] },
        ])
        .exec()
    )[0] as ICommentsRequest;
  }
}
