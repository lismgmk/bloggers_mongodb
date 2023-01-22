import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { IPaginationResponse } from '../../global-dto/common-interfaces';
import { getSortDirection } from '../../helpers/get-sort-direction';
import { paginationDefaultBuilder } from '../../helpers/pagination-default-builder';
import { Comments } from '../../schemas/comments/comments.schema';
import { pageNumber } from '../../test-params/test-values';
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
  ) {}
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
      unset: ['items.total', '_id'],
      userId,
      bannedUsers,
    });
    // return (
    //   await this.commentModel
    //     .aggregate([
    //       {
    //         $match: { postId: new mongoose.Types.ObjectId(postId) },
    //       },
    //       {
    //         $sort: {
    //           [sortField]: sortValue,
    //         },
    //       },
    //       { $setWindowFields: { output: { totalCount: { $count: {} } } } },
    //       {
    //         $skip:
    //           queryParams.pageNumber > 0
    //             ? (queryParams.pageNumber - 1) * queryParams.pageSize
    //             : 0,
    //       },
    //       { $limit: queryParams.pageSize },
    //       {
    //         $project: {
    //           _id: 0,
    //           total: '$totalCount',
    //           id: '$_id',
    //           content: '$content',
    //           userId: '$userId',
    //           userLogin: '$userLogin',
    //           createdAt: '$createdAt',
    //         },
    //       },
    //       {
    //         $lookup: {
    //           from: 'likes',
    //           localField: 'id',
    //           foreignField: 'commentId',
    //           as: 'likesInfo.likesCount',
    //           pipeline: [
    //             {
    //               $match: {
    //                 $expr: {
    //                   $and: [
    //                     { $eq: ['$status', 'Like'] },
    //                     { $in: ['$userId', bannedUsers] },
    //                   ],
    //                 },
    //               },
    //             },
    //           ],
    //         },
    //       },
    //       {
    //         $set: {
    //           'likesInfo.likesCount': {
    //             $size: '$likesInfo.likesCount',
    //           },
    //         },
    //       },
    //       {
    //         $lookup: {
    //           from: 'likes',
    //           localField: 'id',
    //           foreignField: 'commentId',
    //           as: 'likesInfo.myStatus',
    //           pipeline: [
    //             {
    //               $match: {
    //                 $expr: {
    //                   $and: [
    //                     { $eq: ['$userId', userId] },
    //                     { $in: ['$userId', bannedUsers] },
    //                   ],
    //                 },
    //               },
    //             },
    //           ],
    //         },
    //       },
    //       {
    //         $set: {
    //           'likesInfo.myStatus': {
    //             $ifNull: [
    //               {
    //                 $first: '$likesInfo.myStatus.status',
    //               },
    //               'None',
    //             ],
    //           },
    //         },
    //       },
    //       {
    //         $lookup: {
    //           from: 'likes',
    //           localField: 'id',
    //           foreignField: 'commentId',
    //           as: 'likesInfo.dislikesCount',
    //           pipeline: [
    //             {
    //               $match: {
    //                 $expr: {
    //                   $and: [
    //                     { $eq: ['$status', 'Dislike'] },
    //                     { $in: ['$userId', bannedUsers] },
    //                   ],
    //                 },
    //               },
    //             },
    //           ],
    //         },
    //       },
    //       {
    //         $set: {
    //           'likesInfo.dislikesCount': {
    //             $size: '$likesInfo.dislikesCount',
    //           },
    //         },
    //       },

    //       {
    //         $group: {
    //           _id: sortField,
    //           page: { $first: pageNumber },
    //           pageSize: { $first: queryParams.pageSize },
    //           totalCount: { $first: '$$ROOT.total' },
    //           pagesCount: {
    //             $first: {
    //               $ceil: [{ $divide: ['$$ROOT.total', queryParams.pageSize] }],
    //             },
    //           },
    //           items: { $push: '$$ROOT' },
    //         },
    //       },
    //       {
    //         $unset: ['items.total', '_id'],
    //       },
    //     ])
    //     .exec()
    // )[0] as IPaginationResponse<ICommentsRequest[]>;
  }

  async queryCommentById(id: string, bannedUsers: Types.ObjectId[]) {
    const commentId = new mongoose.Types.ObjectId(id);
    return this._agregateFindCommentById({
      singleCondition: { _id: commentId },
      bannedUsers,
    });
    // return (
    //   await this.commentModel
    //     .aggregate([
    //       {
    //         $match: { _id: commentId },
    //       },
    //       {
    //         $project: {
    //           _id: 0,
    //           id: '$_id',
    //           content: '$content',
    //           userId: '$userId',
    //           userLogin: '$userLogin',
    //           createdAt: '$createdAt',
    //         },
    //       },
    //       {
    //         $lookup: {
    //           from: 'likes',
    //           localField: 'id',
    //           foreignField: 'commentId',
    //           as: 'likesInfo.likesCount',
    //           pipeline: [
    //             {
    //               $match: {
    //                 $expr: {
    //                   $and: [{ $eq: ['$status', 'Like'] }],
    //                 },
    //               },
    //             },
    //           ],
    //         },
    //       },
    //       {
    //         $set: {
    //           'likesInfo.likesCount': {
    //             $size: '$likesInfo.likesCount',
    //           },
    //         },
    //       },
    //       {
    //         $lookup: {
    //           from: 'likes',
    //           localField: 'id',
    //           foreignField: 'commentId',
    //           as: 'likesInfo.myStatus',
    //           pipeline: [
    //             {
    //               $match: {
    //                 $expr: {
    //                   $and: [{ $eq: ['$userId', userId] }],
    //                 },
    //               },
    //             },
    //           ],
    //         },
    //       },
    //       {
    //         $set: {
    //           'likesInfo.myStatus': {
    //             $ifNull: [
    //               {
    //                 $first: '$likesInfo.myStatus.status',
    //               },
    //               'None',
    //             ],
    //           },
    //         },
    //       },
    //       {
    //         $lookup: {
    //           from: 'likes',
    //           localField: 'id',
    //           foreignField: 'commentId',
    //           as: 'likesInfo.dislikesCount',
    //           pipeline: [
    //             {
    //               $match: {
    //                 $expr: {
    //                   $and: [{ $eq: ['$status', 'Dislike'] }],
    //                 },
    //               },
    //             },
    //           ],
    //         },
    //       },
    //       {
    //         $set: {
    //           'likesInfo.dislikesCount': {
    //             $size: '$likesInfo.dislikesCount',
    //           },
    //         },
    //       },
    //     ])
    //     .exec()
    // )[0] as IPaginationResponse<ICommentsRequest>;
  }

  async _agregateFindComments(dto: IAgregateComments) {
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
        ])
        .exec()
    )[0] as ICommentsRequest;
  }
}
