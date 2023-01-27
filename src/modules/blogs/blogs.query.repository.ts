import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { IPaginationResponse } from '../../global-dto/common-interfaces';
import { getSortDirection } from '../../helpers/get-sort-direction';
import { paginationDefaultBuilder } from '../../helpers/pagination-default-builder';
import { Blog } from '../../schemas/blog/blog.schema';
import { IAllBlogsSaResponse } from '../sa/types_dto/response_interfaces/all-blogs-sa.response';
import { ICondition } from '../../global-dto/condition-interface';
import { GetAllBlogsQueryMain } from './instance_dto/main_instance/get-all-blogs.instance';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<Blog>) {}
  async queryAllBlogsPagination(
    queryParams: GetAllBlogsQueryMain,
    sa?: boolean,
  ) {
    const sortField = queryParams.sortBy;

    const sortValue = getSortDirection(queryParams.sortDirection);
    const namePart = new RegExp(queryParams.searchNameTerm, 'i');

    const singleCondition = { name: namePart };
    return this._agregateFindBlogs(
      queryParams,
      singleCondition,
      sortField,
      sortValue,
      sa
        ? ['_id', 'items.total', 'items.userId']
        : ['_id', 'items.total', 'items.blogOwnerInfo', 'items.userId'],
    );
  }

  async changeBanStatusBlog(blogId: string, isBanned: boolean) {
    const banDate = isBanned ? new Date().toISOString : null;
    const filter = { 'banInfo.isBanned': isBanned, 'banInfo.banDate': banDate };
    await this.blogModel.findByIdAndUpdate(blogId, filter);
  }

  async getAllUsersBlogsArr(userId: string | ObjectId) {
    const result = await this.blogModel.aggregate([
      { $match: { userId } },
      {
        $project: {
          _id: 1,
        },
      },
    ]);
    return result.map((el) => new Types.ObjectId(el._id));
  }

  async queryAllBlogsForUserPagination(
    queryParams: GetAllBlogsQueryMain,
    userId: string | ObjectId,
  ) {
    const sortField = queryParams.sortBy;
    const sortValue = getSortDirection(queryParams.sortDirection);
    const namePart = new RegExp(queryParams.searchNameTerm, 'i');

    const singleCondition = { name: namePart, userId };

    return this._agregateFindBlogs(
      queryParams,
      singleCondition,
      sortField,
      sortValue,
      ['_id', 'items.total', 'items.blogOwnerInfo', 'items.userId'],
    );
  }
  async _agregateFindBlogs2(
    queryParams,
    singleCondition,
    sortField,
    sortValue,
    unset,
  ) {
    // Define the pipeline stages
    const pipeline = [
      { $match: singleCondition }, // filter by single condition
      { $sort: { [sortField]: sortValue } }, // sort by the provided field and value
      { $count: 'total' }, // count the total number of documents
      { $skip: (queryParams.pageNumber - 1) * queryParams.pageSize }, // skip documents for pagination
      { $limit: queryParams.pageSize }, // limit the number of documents for pagination
      {
        $project: {
          _id: 0,
          name: 1,
          websiteUrl: 1,
          description: 1,
          createdAt: 1,
          userId: 1,
          banInfo: {
            isBanned: '$banInfo.isBanned',
            banDate: '$banInfo.banDate',
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'blogOwnerInfo',
          pipeline: [
            {
              $project: {
                _id: 0,
                userId: 1,
                userLogin: '$accountData.userName',
              },
            },
          ],
        },
      },
      {
        $unwind: '$blogOwnerInfo',
      },
      {
        $group: {
          _id: sortField,
          totalCount: { $first: '$total' },
          pagesCount: {
            $first: { $ceil: { $divide: ['$total', queryParams.pageSize] } },
          },
          items: {
            $push: '$$ROOT',
          },
        },
      },
    ];

    // Execute the pipeline
    const result = await this.blogModel.aggregate(pipeline).exec();

    // Return the result or a default pagination object if no result is found
    return (
      result[0] ||
      paginationDefaultBuilder({
        pageSize: queryParams.pageSize,
        pageNumber: queryParams.pageNumber,
      })
    );
  }

  async _agregateFindBlogs(
    queryParams: GetAllBlogsQueryMain,
    singleCondition: ICondition,
    sortField: string,
    sortValue: 1 | -1,
    unset: string[],
  ) {
    const result = (
      await this.blogModel
        .aggregate([
          {
            $match: singleCondition,
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
              name: '$name',
              websiteUrl: '$websiteUrl',
              description: '$description',
              createdAt: '$createdAt',
              userId: '$userId',
              banInfo: {
                isBanned: '$banInfo.isBanned',
                banDate: '$banInfo.banDate',
              },
            },
          },

          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'blogOwnerInfo',
              pipeline: [
                {
                  $project: {
                    _id: 0,
                    userId: '$_id',
                    userLogin: '$accountData.userName',
                  },
                },
              ],
            },
          },
          {
            $set: {
              blogOwnerInfo: {
                $first: '$blogOwnerInfo',
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
            $unset: unset,
          },
        ])
        .exec()
    )[0] as IPaginationResponse<IAllBlogsSaResponse[]>;
    return (
      result ||
      paginationDefaultBuilder({
        pageSize: queryParams.pageSize,
        pageNumber: queryParams.pageNumber,
      })
    );
  }
}
