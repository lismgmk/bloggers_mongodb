import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { IPaginationResponse } from 'global-dto/common-interfaces';
import { paginationBuilder, paramsDto } from 'helpers/pagination-builder';
import { IBlog } from 'modules/blogs/dto/blogs-intergaces';
import { Model } from 'mongoose';
import { Blog } from 'schemas/blog.schema';
import { GetAllBlogsQueryDto } from '../impl/get-all-blogs-query.dto';

@QueryHandler(GetAllBlogsQueryDto)
export class GetBlogsHandler implements IQueryHandler<GetAllBlogsQueryDto> {
  constructor(@InjectModel(Blog.name) private blogsModel: Model<Blog>) {}
  async execute(
    queryParams: GetAllBlogsQueryDto,
  ): Promise<IPaginationResponse<IBlog>> {
    const namePart = new RegExp(queryParams.searchNameTerm);

    const filter = {
      name: namePart,
    };

    const allBlogs: IBlog[] = (
      await this.blogsModel
        .find(filter)
        .sort({ [queryParams.sortBy]: queryParams.sortDirection })
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
        youtubeUrl: i.youtubeUrl,
      };
    });

    const totalCount = await this.blogsModel.countDocuments().exec();
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
