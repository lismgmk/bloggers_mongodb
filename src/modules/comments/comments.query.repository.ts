import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { IPaginationResponse } from '../../global-dto/common-interfaces';
import { Comments } from '../../schemas/comments.schema';
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
  ) {
    const sortField = queryParams.sortBy;
    const sortValue = queryParams.sortDirection === 'desc' ? 1 : -1;

    // const db = mongoose.connection.createCollection('user');
    const UserSchema = new mongoose.Schema(
      {
        userName: {
          type: String,
          required: true,
        },
        count: {
          type: Number,
          required: true,
          default: 0,
        },
        log: [
          {
            description: { type: String, required: true },
            duration: { type: Number, required: true },
          },
        ],
      },
      { collection: 'user' },
    );
    mongoose.model('user', UserSchema).aggregate([
      {
        $project: {
          id: '$_id',
          userName: '$userName',
          count: '$count',
          log: { $slice: ['$log', 2] },
        },
      },
    ]);

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
