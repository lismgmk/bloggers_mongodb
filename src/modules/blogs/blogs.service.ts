import { IBlog } from './dto/blogs-intergaces';
import { Blogs } from 'schemas/blogs.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetAllBlogsQueryDto } from './dto/get-all-blogs-query.dto';
import { IPaginationResponse } from 'global-dto/common-interfaces';
import { paginationBuilder, paramsDto } from 'helpers/pagination-builder';
import { CreateBlogDto } from './dto/create-blog.dto';

@Injectable()
export class BlogsService {
  constructor(@InjectModel(Blogs.name) private blogsModel: Model<Blogs>) {}

  async getAllBlogs(
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
  async createBlog(dto: CreateBlogDto) {
    const newBlog = new this.blogsModel({
      name: dto.name,
      youtubeUrl: dto.youtubeUrl,
      createdAt: new Date(),
    });
    const createdBlog = (await this.blogsModel.create(newBlog)) as Blogs;
    return {
      id: createdBlog._id.toString(),
      name: createdBlog.name,
      youtubeUrl: createdBlog.youtubeUrl,
      createdAt: createdBlog.createdAt,
    } as IBlog;
  }
}
