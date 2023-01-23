import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IPaginationResponse } from '../../global-dto/common-interfaces';
import { paginationDefaultBuilder } from '../../helpers/pagination-default-builder';
import { UserMain } from '../../schemas/users/users.instance';
import { User } from '../../schemas/users/users.schema';
import { GetAllUsersMain } from './instance_dto/main_instance/get-all-user.instance';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async getAllUsersSaPagination(queryParams: GetAllUsersMain) {
    const loginPart = new RegExp(queryParams.searchLoginTerm, 'i');
    const emailPart = new RegExp(queryParams.searchEmailTerm, 'i');
    const filterArr = [];
    const banFilter = {};
    const sortField =
      queryParams.sortBy === 'login' ? 'userName' : queryParams.sortBy;
    queryParams.banStatus === 'banned'
      ? (banFilter[`banInfo.isBanned`] = true)
      : (banFilter[`banInfo.isBanned`] = false);
    let sortValue: string | 1 | -1 = -1;
    if (queryParams.sortDirection === 'desc') {
      sortValue = -1;
    }
    if (queryParams.sortDirection === 'asc') {
      sortValue = 1;
    }
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
    return (
      result ||
      paginationDefaultBuilder({
        pageSize: queryParams.pageSize,
        pageNumber: queryParams.pageNumber,
      })
    );
  }
}
