import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { IPaginationResponse } from '../../global-dto/common-interfaces';
import { Posts } from '../../schemas/posts/posts.schema';
import { IPostsRequest } from './instance_dto/response_interfaces/all-posts-response';
import { GetAllPostsdDto } from './instance_dto/dto_validate/get-all-posts.dto';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Posts.name) private postModel: Model<Posts>) {}

  async queryAllPostsPagination(
    queryParams: GetAllPostsdDto,
    blogId: string = null,
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

    const singleCondition: { match: any; unset: string[] } = blogId
      ? {
          match: { blogId: new mongoose.Types.ObjectId(blogId) },
          unset: ['items.total', '_id', 'items.userId'],
        }
      : { match: {}, unset: ['items.total', '_id', 'items.userId'] };

    // const arr = [
    //   new mongoose.Types.ObjectId('63c526ea1a3773deedebbeab'),
    //   new mongoose.Types.ObjectId('63c532419e9e35ed53f59cbc'),
    // ];
    // const arr2 = [
    //   new mongoose.Types.ObjectId('64c526ea1a3773deedebbeab'),
    //   new mongoose.Types.ObjectId('64c532419e9e35ed53f59cbc'),
    // ];

    return (
      await this.postModel
        .aggregate([
          {
            $match: singleCondition.match,
          },
          // {
          //   $lookup: {
          //     from: 'users',
          //     localField: 'id',
          //     foreignField: 'userId',
          //     as: 'user',
          //     pipeline: [
          //       {
          //         $match: {
          //           $expr: {
          //             $and: [
          //               {
          //                 $eq: ['$banInfo.isBanned', false],
          //               },
          //             ],
          //           },
          //         },
          //       },
          //       {
          //         $project: {
          //           _id: 0,
          //           array: '$_id',
          //         },
          //       },
          //     ],
          //   },
          // },
          // {
          //   $unwind: {
          //     path: '$user',
          //     preserveNullAndEmptyArrays: true,
          //   },
          // },
          // { $match: { userId: { $in: '$user' } } },

          // {
          //   $unwind: {
          //     path: '$user',
          //     preserveNullAndEmptyArrays: true,
          //   },
          // },

          // {
          //   $unset: ['user'],
          // },
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
              // user: {
              //   $first: {
              //     $map: {
              //       input: '$user.array',
              //       as: 'decimalValue',
              //       in: '$user.array',
              //     },
              //   },
              // },
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
                // $in: arr,
              },
            },
          },
          {
            $lookup: {
              from: 'likes',
              localField: 'postId',
              foreignField: 'id',
              as: 'extendedLikesInfo.newestLikes',
              pipeline: [
                // {
                //   $lookup: {
                //     from: 'users',
                //     localField: '_id',
                //     foreignField: 'userId',
                //     as: 'extendedLikesInfo.newestLikes22',
                //     let: {
                //       // userLike: '$likesNew.userId',
                //       likeStatus: 'likesNew.status',
                //     },

                //     pipeline: [
                //       {
                //         $match: {
                //           $expr: {
                //             $and: [
                //               { $eq: ['$$likeStatus', 'Like'] },
                //               { $eq: ['$banInfo.isBanned', false] },
                //             ],
                //           },
                //         },
                //       },
                //       // {
                //       //   $unwind: {
                //       //     path: '$likesNew.status',
                //       //     preserveNullAndEmptyArrays: true,
                //       //   },
                //       // },
                //     ],
                //   },
                // },
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$status', 'Like'] },
                        { $in: ['$userId', bannedUsers] },
                        // { $in: ['$userId', arr] },
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
                        // { $in: ['$userId', arr] },
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
                        // { $in: ['$userId', arr] },
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
  }

  async queryPostById(id: string, userId: string) {
    const postId = new mongoose.Types.ObjectId(id);
    return (
      await this.postModel
        .aggregate([
          {
            $match: { _id: postId },
          },
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
              as: 'extendedLikesInfo.likesCount',
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
              as: 'extendedLikesInfo.dislikesCount',
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
        ])
        .exec()
    )[0] as IPostsRequest;
  }
}
