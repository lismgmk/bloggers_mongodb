import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IPaginationResponse } from '../../../../global-dto/common-interfaces';
import {
  paramsDto,
  paginationBuilder,
} from '../../../../helpers/pagination-builder';
import { Blog } from '../../../../schemas/blog.schema';
import { IBlog } from '../../dto/blogs-intergaces';
import { GetAllBlogsQueryDto } from '../impl/get-all-blogs-query.dto';

@QueryHandler(GetAllBlogsQueryDto)
export class GetBlogsHandler implements IQueryHandler<GetAllBlogsQueryDto> {
  constructor(@InjectModel(Blog.name) private blogsModel: Model<Blog>) {}
  async execute(
    queryParams: GetAllBlogsQueryDto,
  ): Promise<IPaginationResponse<IBlog>> {
    const namePart = new RegExp(queryParams.searchNameTerm, 'i');
    const sortValue = queryParams.sortDirection || 'desc';
    const filter = {
      name: namePart,
    };

    const allBlogs: IBlog[] = (
      await this.blogsModel
        .find(filter)
        .sort({ [queryParams.sortBy]: sortValue })
        .skip(
          queryParams.pageNumber > 0
            ? (queryParams.pageNumber - 1) * queryParams.pageSize
            : 0,
        )
        .limit(queryParams.pageSize)
        .lean()
    ).map((i) => {
      return {
        id: i._id,
        name: i.name,
        createdAt: i.createdAt,
        websiteUrl: i.websiteUrl,
        description: i.description,
      };
    });

    const totalCount = await this.blogsModel
      .find(filter)
      .sort({ [queryParams.sortBy]: sortValue })
      .countDocuments()
      .exec();
    const paginationParams: paramsDto = {
      totalCount: totalCount,
      pageSize: queryParams.pageSize,
      pageNumber: queryParams.pageNumber,
    };
    return {
      ...paginationBuilder(paginationParams),
      items: allBlogs,
    };
  }
}
