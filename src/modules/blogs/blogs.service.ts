import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { IPaginationResponse } from 'global-dto/common-interfaces';
import { Model } from 'mongoose';
import { Blog } from 'schemas/blog.schema';
import { IBlog } from './dto/blogs-intergaces';
import { CreateBlogDto } from './dto/create-blog.dto';
import { GetAllBlogsQueryDto } from './queries/impl/get-all-blogs-query.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<Blog>,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  async getAllBlogs(
    queryParams: GetAllBlogsQueryDto,
  ): Promise<IPaginationResponse<IBlog>> {
    return await this.queryBus.execute(queryParams);

    // const namePart = new RegExp(queryParams.searchNameTerm);

    // const filter = {
    //   name: namePart,
    // };

    // const allBlogs: IBlog[] = (
    //   await this.blogsModel
    //     .find(filter)
    //     .sort({ [queryParams.sortBy]: queryParams.sortDirection })
    //     .skip(
    //       queryParams.pageNumber > 0
    //         ? (queryParams.pageNumber - 1) * queryParams.pageSize
    //         : 0,
    //     )
    //     .limit(queryParams.pageSize)
    //     .lean()
    // ).map((i) => {
    //   return {
    //     id: i._id,
    //     name: i.name,
    //     createdAt: i.createdAt,
    //     youtubeUrl: i.youtubeUrl,
    //   };
    // });

    // const totalCount = await this.blogsModel.countDocuments().exec();
    // const paginationParams: paramsDto = {
    //   totalCount: totalCount,
    //   pageSize: queryParams.pageSize,
    //   pageNumber: queryParams.pageNumber,
    // };
    // return {
    //   ...paginationBuilder(paginationParams),
    //   items: allBlogs,
    // };
  }

  async createBlog(dto: CreateBlogDto) {
    const newBlog = new this.blogModel({
      name: dto.name,
      youtubeUrl: dto.youtubeUrl,
      createdAt: new Date(),
    });
    const createdBlog = (await this.blogModel.create(newBlog)) as Blog;
    return {
      id: createdBlog._id.toString(),
      name: createdBlog.name,
      youtubeUrl: createdBlog.youtubeUrl,
      createdAt: createdBlog.createdAt,
    } as IBlog;
  }

  async getBlogById(id: string) {
    return await this.blogModel.findById(id).exec();
  }

  async deleteBlogById(id: string) {
    return this.blogModel.findByIdAndDelete(id);
  }

  async changeBlog(dto: CreateBlogDto & { id: string }) {
    const blog = (await this.blogModel.findById(dto.id)) as Blog;
    blog.name = dto.name;
    blog.youtubeUrl = dto.youtubeUrl;
    blog.save();
    return;
  }

  // async getPostsForBloggerId(id: string) {}
}
