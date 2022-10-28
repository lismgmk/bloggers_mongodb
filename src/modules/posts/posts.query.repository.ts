import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IPaginationResponse } from 'global-dto/common-interfaces';
import mongoose, { Model } from 'mongoose';
import { Posts } from 'schemas/posts.schema';
import { pageNumber } from '../../test-params/test-values';
import { IPostsRequest } from './dto/all-posts-response';
import { GetAllPostsdDto } from './dto/get-all-posts.dto';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Posts.name) private postModel: Model<Posts>) {}
  async queryAllPostsPagination(
    queryParams: GetAllPostsdDto,
    blogId: string = null,
    userId: string,
  ) {
    const sortField = queryParams.sortBy;
    const sortValue = queryParams.sortDirection === 'desc' ? -1 : 1;
    const singleCondition: { match: any; unset: string[] } = blogId
      ? {
          match: { blogId: new mongoose.Types.ObjectId(blogId) },
          unset: ['items.total', '_id', 'items.extendedLikesInfo'],
        }
      : { match: {}, unset: ['items.total', '_id'] };

    return (
      await this.postModel
        .aggregate([
          {
            $match: singleCondition.match,
            // {
            // _id: blogId,
            // content: '  DDDDDD ',
            // $expr: {
            //   $cond: [{ $ne: [content, null] }, { content: content }, {}],
            // },
            // },
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
                      $and: [{ $eq: ['$status', 'Like'] }],
                    },
                  },
                },
                { $sort: { createdAt: 1 } },
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
            },
          },
          {
            $lookup: {
              from: 'likes',
              localField: 'id',
              foreignField: 'postId',
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
            $unset: singleCondition.unset,
          },
        ])
        .exec()
    )[0] as IPaginationResponse<IPostsRequest[]>;
  }
}