import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { match } from 'assert';
import { id } from 'date-fns/locale';
import mongoose, { Model } from 'mongoose';
import { IPaginationResponse } from '../../global-dto/common-interfaces';
import { ICondition } from '../../global-dto/condition-interface';
import { PaginationQueryDto } from '../../global-dto/dto_validate/pagination-query.dto';
import { getSortDirection } from '../../helpers/get-sort-direction';
import { paginationDefaultBuilder } from '../../helpers/pagination-default-builder';
import { BanInfoBlogger } from '../../schemas/banBlogger/ban-blogger.schema';
import {
  BanInfoBloggerMain,
  UserMain,
} from '../../schemas/users/users.instance';
import { User } from '../../schemas/users/users.schema';
import { GetAllBlogsQueryMain } from '../blogs/instance_dto/main_instance/get-all-blogs.instance';
import { BanUserMain } from './instance_dto/main_instance/ban-user.instance';
import { GetAllUsersMain } from './instance_dto/main_instance/get-all-user.instance';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(BanInfoBlogger.name)
    private banInfoBloggerModel: Model<BanInfoBlogger>,
  ) {}

  async getAllUsersSaPagination(queryParams: GetAllUsersMain) {
    const loginPart = new RegExp(queryParams.searchLoginTerm, 'i');
    const emailPart = new RegExp(queryParams.searchEmailTerm, 'i');
    const filterArr = [];
    const banFilter = {};
    const sortField =
      queryParams.sortBy === 'login' ? 'userName' : queryParams.sortBy;
    queryParams.banStatus === 'banned'
      ? (banFilter[`banInfoSa.isBanned`] = true)
      : (banFilter[`banInfoSa.isBanned`] = false);
    const sortValue = getSortDirection(queryParams.sortDirection);
    if (queryParams.banStatus !== 'all') {
      filterArr.push(banFilter);
    }
    const searchEmailLogin = { $or: [] };

    queryParams.searchLoginTerm &&
      searchEmailLogin.$or.push({
        'accountData.userName': loginPart,
      });
    queryParams.searchEmailTerm &&
      searchEmailLogin.$or.push({
        'accountData.email': emailPart,
      });

    if (searchEmailLogin.$or.length !== 0) {
      filterArr.push(searchEmailLogin);
    }

    let resultFilter;
    filterArr.length === 0
      ? (resultFilter = {})
      : (resultFilter = { $and: filterArr });
    const result = (
      await this.userModel
        .aggregate([
          {
            $match: resultFilter,
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
                isBanned: '$banInfoSa.isBanned',
                banDate: '$banInfoSa.banDate',
                banReason: '$banInfoSa.banReason',
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
            $unset: ['items.total', '_id', 'items.banInfoBloggers'],
          },
        ])
        .exec()
    )[0] as IPaginationResponse<UserMain[]>;
    return (
      result ||
      paginationDefaultBuilder({
        pageSize: queryParams.pageSize,
        pageNumber: queryParams.pageNumber,
      })
    );
  }
  async getBannedUsersForBlog(
    queryParams: GetAllBlogsQueryMain,
    blogId: string,
  ) {
    const condition: ICondition = {
      blogId: new mongoose.Types.ObjectId(blogId),
      isBanned: true,
    };
    const sortValue = getSortDirection(queryParams.sortDirection);
    const loginPart = new RegExp(queryParams.searchLoginTerm, 'i');
    if (queryParams.searchLoginTerm) {
      condition.login = loginPart;
    }
    const result = (
      await this.banInfoBloggerModel
        .aggregate([
          { $match: condition },
          {
            $sort: {
              [queryParams.sortBy]: sortValue,
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
              id: '$_id',
              total: '$totalCount',
              login: '$login',
              banInfo: {
                isBanned: '$isBanned',
                banDate: '$banDate',
                banReason: '$banReason',
              },
            },
          },
          {
            $group: {
              _id: queryParams.sortBy,
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
            $unset: ['items.total', '_id', 'items.banInfoBloggers'],
          },
        ])
        .exec()
    )[0] as IPaginationResponse<any[]>;
    return (
      result ||
      paginationDefaultBuilder({
        pageSize: queryParams.pageSize,
        pageNumber: queryParams.pageNumber,
      })
    );
  }
}
