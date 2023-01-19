import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IPaginationResponse } from '../../global-dto/common-interfaces';
import { UserMain } from '../../schemas/users/users.instance';
import { User } from '../../schemas/users/users.schema';
import { GetAllUsersMain } from './instance_dto/main_instance/get-all-user.instance';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async getAllUsersSaPagination(queryParams: GetAllUsersMain) {
    const sortField = queryParams.sortBy;
    let sortValue: string | 1 | -1 = -1;
    if (queryParams.sortDirection === 'desc') {
      sortValue = -1;
    }
    if (queryParams.sortDirection === 'asc') {
      sortValue = 1;
    }
    const loginPart = new RegExp(queryParams.searchLoginTerm, 'i');
    const emailPart = new RegExp(queryParams.searchEmailTerm, 'i');
    const filterArr = [];
    queryParams.searchLoginTerm &&
      filterArr.push({
        'accountData.userName': loginPart,
      });
    queryParams.searchEmailTerm &&
      filterArr.push({
        'accountData.email': emailPart,
      });
    !queryParams.searchEmailTerm &&
      !queryParams.searchLoginTerm &&
      filterArr.push({});
    return (
      await this.userModel
        .aggregate([
          {
            $match: { $or: filterArr },
          },
          {
            $sort: {
              [`accountData.${sortField}`]: sortValue,
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
              login: '$accountData.userName',
              email: '$accountData.email',
              createdAt: '$accountData.createdAt',
              banInfo: {
                isBanned: '$banInfo.isBanned',
                banDate: '$banInfo.banDate',
                banReason: '$banInfo.banReason',
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
            $unset: ['items.total', '_id'],
          },
        ])
        .exec()
    )[0] as IPaginationResponse<UserMain[]>;
  }

  // async queryPostById(id: string, userId: string) {
  //   const postId = new mongoose.Types.ObjectId(id);
  //   return (
  //     await this.postModel
  //       .aggregate([
  //         {
  //           $match: { _id: postId },
  //         },
  //         {
  //           $project: {
  //             _id: 0,
  //             total: '$totalCount',
  //             id: '$_id',
  //             title: '$title',
  //             shortDescription: '$shortDescription',
  //             content: '$content',
  //             blogId: '$blogId',
  //             blogName: '$blogName',
  //             createdAt: '$createdAt',
  //           },
  //         },
  //         {
  //           $lookup: {
  //             from: 'likes',
  //             localField: 'id',
  //             foreignField: 'postId',
  //             as: 'extendedLikesInfo.newestLikes',
  //             pipeline: [
  //               {
  //                 $match: {
  //                   $expr: {
  //                     $and: [{ $eq: ['$status', 'Like'] }],
  //                   },
  //                 },
  //               },
  //               { $sort: { createdAt: -1 } },
  //               { $limit: 3 },
  //               {
  //                 $project: {
  //                   _id: 0,
  //                   addedAt: '$createdAt',
  //                   userId: '$userId',
  //                   login: '$login',
  //                 },
  //               },
  //             ],
  //           },
  //         },

  //         {
  //           $lookup: {
  //             from: 'likes',
  //             localField: 'id',
  //             foreignField: 'postId',
  //             as: 'extendedLikesInfo.likesCount',
  //             pipeline: [
  //               {
  //                 $match: {
  //                   $expr: {
  //                     $and: [{ $eq: ['$status', 'Like'] }],
  //                   },
  //                 },
  //               },
  //             ],
  //           },
  //         },
  //         {
  //           $set: {
  //             'extendedLikesInfo.likesCount': {
  //               $size: '$extendedLikesInfo.likesCount',
  //             },
  //           },
  //         },
  //         {
  //           $lookup: {
  //             from: 'likes',
  //             localField: 'id',
  //             foreignField: 'postId',
  //             as: 'extendedLikesInfo.dislikesCount',
  //             pipeline: [
  //               {
  //                 $match: {
  //                   $expr: {
  //                     $and: [{ $eq: ['$status', 'Dislike'] }],
  //                   },
  //                 },
  //               },
  //             ],
  //           },
  //         },
  //         {
  //           $set: {
  //             'extendedLikesInfo.dislikesCount': {
  //               $size: '$extendedLikesInfo.dislikesCount',
  //             },
  //           },
  //         },
  //         {
  //           $lookup: {
  //             from: 'likes',
  //             localField: 'id',
  //             foreignField: 'postId',
  //             as: 'extendedLikesInfo.myStatus',
  //             pipeline: [
  //               {
  //                 $match: {
  //                   $expr: {
  //                     $and: [{ $eq: ['$userId', userId] }],
  //                   },
  //                 },
  //               },
  //             ],
  //           },
  //         },
  //         {
  //           $set: {
  //             'extendedLikesInfo.myStatus': {
  //               $ifNull: [
  //                 {
  //                   $first: '$extendedLikesInfo.myStatus.status',
  //                 },
  //                 'None',
  //               ],
  //             },
  //           },
  //         },
  //       ])
  //       .exec()
  //   )[0] as IPostsRequest;
  // }
}
