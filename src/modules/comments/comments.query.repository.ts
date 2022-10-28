import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IPaginationResponse } from 'global-dto/common-interfaces';
import mongoose, { Model } from 'mongoose';
import { Comments } from 'schemas/comments.schema';
import { pageNumber } from '../../test-params/test-values';
import { ICommentsRequest } from './dto/all-comments-response';
import { GetAllCommentsDto } from './dto/get-all-comments.dto';

@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectModel(Comments.name) private postModel: Model<Comments>) {}
  async queryAllCommentsPagination(
    queryParams: GetAllCommentsDto,
    postId: string = null,
    userId: string,
  ) {
    const sortField = queryParams.sortBy;
    const sortValue = queryParams.sortDirection === 'desc' ? -1 : 1;
    // const singleCondition: { match: any; unset: string[] } = blogId
    //   ? {
    //       match: { blogId: new mongoose.Types.ObjectId(blogId) },
    //       unset: ['items.total', '_id', 'items.extendedLikesInfo'],
    //     }
    //   : { match: {}, unset: ['items.total', '_id'] };

    return (
      await this.postModel
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
              as: 'likeInfo.likeCount',
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
              'likeInfo.likeCount': {
                $size: '$likeInfo.likeCount',
              },
            },
          },
          {
            $lookup: {
              from: 'likes',
              localField: 'id',
              foreignField: 'commentId',
              as: 'likeInfo.myStatus',
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
              'likeInfo.myStatus': {
                $ifNull: [
                  {
                    $first: '$likeInfo.myStatus.status',
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
              as: 'likeInfo.dislikeCount',
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
              'likeInfo.dislikeCount': {
                $size: '$likeInfo.dislikeCount',
              },
            },
          },

          {
            $group: {
              _id: sortField,
              page: { $first: pageNumber },
              pageSize: { $first: queryParams.pageSize },
              totalCount: { $first: '$$ROOT.total' },
              pageCount: {
                $first: {
                  $round: [
                    { $divide: ['$$ROOT.total', queryParams.pageSize] },
                    0,
                  ],
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
}
