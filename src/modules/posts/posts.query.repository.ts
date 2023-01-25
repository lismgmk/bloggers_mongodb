import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { IPaginationResponse } from '../../global-dto/common-interfaces';
import { Posts } from '../../schemas/posts/posts.schema';
import { IPostsRequest } from './instance_dto/response_interfaces/all-posts-response';
import { GetAllPostsdDto } from './instance_dto/dto_validate/get-all-posts.dto';
import { UsersService } from '../users/users.service';
import { getSortDirection } from '../../helpers/get-sort-direction';
import { paginationDefaultBuilder } from '../../helpers/pagination-default-builder';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Posts.name) private postModel: Model<Posts>,
    private usersService: UsersService,
  ) {}

  async queryAllPostsPagination(
    queryParams: GetAllPostsdDto,
    blogId: string = null,
    userId: string,
  ) {
    const bannedUsers = await this.usersService.getAllBannedUsers();



    const sortField = queryParams.sortBy;
    const sortValue = getSortDirection(queryParams.sortDirection);

    const singleCondition: { match: any; unset: string[] } = blogId
      ? {
          match: { blogId: new mongoose.Types.ObjectId(blogId) },
          unset: ['items.total', '_id', 'items.userId'],
        }
      : { match: {}, unset: ['items.total', '_id', 'items.userId'] };

    const skipParam =
      queryParams.pageNumber > 0
        ? (queryParams.pageNumber - 1) * queryParams.pageSize
        : 0;

    const result = (
      await this.postModel
        .aggregate([
          {
            $match: singleCondition.match,
          },

          {
            $sort: {
              [sortField]: sortValue,
            },
          },
          { $setWindowFields: { output: { totalCount: { $count: {} } } } },
          {
            $skip: skipParam,
          },
          { $limit: queryParams.pageSize },
          {
            $project: {
              _id: 0,
              total: '$totalCount',
              id: '$_id',
              title: '$title',
              shortDescription: '$shortDescription',
              content: '$content',
              blogId: '$blogId',
              blogName: '$blogName',
              createdAt: '$createdAt',
              userId: '$userId',
            },
          },
          {
            $match: {
              userId: {
                $in: bannedUsers,
              },
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
                      $and: [
                        { $eq: ['$status', 'Like'] },
                        { $in: ['$userId', bannedUsers] },
                      ],
                    },
                  },
                },
                { $sort: { createdAt: -1 } },
                { $limit: 3 },
                {
                  $project: {
                    _id: 0,
                    addedAt: '$createdAt',
                    userId: '$userId',
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
              let: { user: '$user._id', userStatus: 'user.banInfo.isBanned' },
              as: 'extendedLikesInfo.likesCount',
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$status', 'Like'] },
                        { $in: ['$userId', bannedUsers] },
                      ],
                    },
                  },
                },
              ],
            },
          },
          {
            $set: {
              'extendedLikesInfo.likesCount': {
                $size: '$extendedLikesInfo.likesCount',
              },
            },
          },
          {
            $lookup: {
              from: 'likes',
              localField: 'id',
              foreignField: 'postId',
              let: { user: '$user._id', userStatus: 'user.banInfo.isBanned' },
              as: 'extendedLikesInfo.dislikesCount',
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$status', 'Dislike'] },
                        { $in: ['$userId', bannedUsers] },
                      ],
                    },
                  },
                },
              ],
            },
          },
          {
            $set: {
              'extendedLikesInfo.dislikesCount': {
                $size: '$extendedLikesInfo.dislikesCount',
              },
            },
          },
          {
            $lookup: {
              from: 'likes',
              localField: 'id',
              foreignField: 'postId',
              let: { user: '$user._id', userStatus: 'user.banInfo.isBanned' },
              as: 'extendedLikesInfo.myStatus',
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ['$userId', userId] }],
                    },
                  },
                },
              ],
            },
          },
          {
            $set: {
              'extendedLikesInfo.myStatus': {
                $ifNull: [
                  {
                    $first: '$extendedLikesInfo.myStatus.status',
                  },
                  'None',
                ],
              },
            },
          },
          {
            $group: {
              _id: sortField,
              page: { $first: queryParams.pageNumber },
              pageSize: { $first: queryParams.pageSize },
              totalCount: { $first: '$$ROOT.total' },
              pagesCount: {
                $first: {
                  $ceil: [{ $divide: ['$$ROOT.total', queryParams.pageSize] }],
                },
              },
              items: { $push: '$$ROOT' },
            },
          },
          {
            $unset: singleCondition.unset,
          },
        ])
        .exec()
    )[0] as IPaginationResponse<IPostsRequest[]>;
    return (
      result ||
      paginationDefaultBuilder({
        pageSize: queryParams.pageSize,
        pageNumber: queryParams.pageNumber,
      })
    );
  }

  async queryPostById(id: string) {
    const bannedUsers = await this.usersService.getAllBannedUsers();

    const postId = new mongoose.Types.ObjectId(id);

    const result = (
      await this.postModel
        .aggregate([
          {
            $match: { _id: postId },
          },

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
              userId: '$userId',
            },
          },
          {
            $match: {
              userId: {
                $in: bannedUsers,
              },
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
                      $and: [
                        { $eq: ['$status', 'Like'] },
                        { $in: ['$userId', bannedUsers] },
                      ],
                    },
                  },
                },
                { $sort: { createdAt: -1 } },
                { $limit: 3 },
                {
                  $project: {
                    _id: 0,
                    addedAt: '$createdAt',
                    userId: '$userId',
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
              let: { user: '$user._id', userStatus: 'user.banInfo.isBanned' },
              as: 'extendedLikesInfo.likesCount',
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$status', 'Like'] },
                        { $in: ['$userId', bannedUsers] },
                      ],
                    },
                  },
                },
              ],
            },
          },
          {
            $set: {
              'extendedLikesInfo.likesCount': {
                $size: '$extendedLikesInfo.likesCount',
              },
            },
          },
          {
            $lookup: {
              from: 'likes',
              localField: 'id',
              foreignField: 'postId',
              let: { user: '$user._id', userStatus: 'user.banInfo.isBanned' },
              as: 'extendedLikesInfo.dislikesCount',
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$status', 'Dislike'] },
                        { $in: ['$userId', bannedUsers] },
                      ],
                    },
                  },
                },
              ],
            },
          },
          {
            $set: {
              'extendedLikesInfo.myStatus': 'None',
              'extendedLikesInfo.dislikesCount': {
                $size: '$extendedLikesInfo.dislikesCount',
              },
            },
          },

          {
            $unset: ['userId'],
          },
        ])
        .exec()
    )[0] as IPostsRequest;
    return result;
  }
}
