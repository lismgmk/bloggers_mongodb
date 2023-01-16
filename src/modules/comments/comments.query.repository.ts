import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { IPaginationResponse } from '../../global-dto/common-interfaces';
import { Comments } from '../../schemas/comments/comments.schema';
import { pageNumber } from '../../test-params/test-values';
import { ICommentsRequest } from './dto/all-comments-response';
import { GetAllCommentsDto } from './dto/get-all-comments.dto';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comments.name) private commentModel: Model<Comments>,
  ) {}
  async queryAllCommentsPagination(
    queryParams: GetAllCommentsDto,
    postId: string = null,
    userId: string,
    bannedUsers: Types.ObjectId[],
  ) {
    const sortField = queryParams.sortBy;
    let sortValue: string | 1 | -1 = -1;
    if (queryParams.sortDirection === 'desc') {
      sortValue = -1;
    }
    if (queryParams.sortDirection === 'asc') {
      sortValue = 1;
    }
    return (
      await this.commentModel
        .aggregate([
          {
            $match: { postId: new mongoose.Types.ObjectId(postId) },
          },
          {
            $sort: {
              [sortField]: sortValue,
            },
          },
          { $setWindowFields: { output: { totalCount: { $count: {} } } } },
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
                        { $eq: ['$userId', userId] },
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
              'likesInfo.dislikesCount': {
                $size: '$likesInfo.dislikesCount',
              },
            },
          },

          {
            $group: {
              _id: sortField,
              page: { $first: pageNumber },
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
            $unset: ['items.total', '_id'],
          },
        ])
        .exec()
    )[0] as IPaginationResponse<ICommentsRequest[]>;
  }

  async queryCommentById(id: string, userId: string) {
    const commentId = new mongoose.Types.ObjectId(id);
    return (
      await this.commentModel
        .aggregate([
          {
            $match: { _id: commentId },
          },
          {
            $project: {
              _id: 0,
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
                      $and: [{ $eq: ['$status', 'Like'] }],
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
                      $and: [{ $eq: ['$userId', userId] }],
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
                      $and: [{ $eq: ['$status', 'Dislike'] }],
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
        ])
        .exec()
    )[0] as IPaginationResponse<ICommentsRequest>;
  }
}
