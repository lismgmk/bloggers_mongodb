import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { IPaginationResponse } from '../../global-dto/common-interfaces';
import { paginationBuilder, paramsDto } from '../../helpers/pagination-builder';
import { Blog } from '../../schemas/blog.schema';
import { GetAllPostsdDto } from '../posts/instance_dto/dto_validate/get-all-posts.dto';
import { PostsQueryRepository } from '../posts/posts.query.repository';
import { IAllBlogsSaResponse } from '../sa/types_dto/response_interfaces/all-blogs-sa.response';
import { BlogsQueryRepository } from './blogs.query.repository';
import { IBlog } from './dto/blogs-intergaces';
import { ICreateBlog } from './dto/create-blog.interface';
import { GetAllBlogsQueryDto } from './queries/impl/get-all-blogs-query.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<Blog>,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async getBlogs(
    queryParams: GetAllBlogsQueryDto,
  ): Promise<IPaginationResponse<IAllBlogsSaResponse[]>> {
    return this.blogsQueryRepository.queryAllBlogsPagination(queryParams);
  }

  async getAllBlogsForUser(
    queryParams: GetAllBlogsQueryDto,
    userId: string | ObjectId,
  ): Promise<IPaginationResponse<IAllBlogsSaResponse[]>> {
    return this.blogsQueryRepository.queryAllBlogsForUserPagination(
      queryParams,
      userId,
    );
  }

  async getAllBlogs(
    queryParams: GetAllBlogsQueryDto,
    userId: string | ObjectId,
  ): Promise<IPaginationResponse<IBlog>> {
    return await this.queryBus.execute({ ...queryParams, userId });
  }

  async createBlog(dto: ICreateBlog) {
    const newBlog = new this.blogModel({
      name: dto.name,
      websiteUrl: dto.websiteUrl,
      description: dto.description,
      createdAt: new Date().toISOString(),
      userId: dto.userId,
    });
    const createdBlog = (await this.blogModel.create(newBlog)) as Blog;
    return {
      id: createdBlog._id.toString(),
      name: createdBlog.name,
      websiteUrl: createdBlog.websiteUrl,
      description: createdBlog.description,
      createdAt: createdBlog.createdAt,
    } as IBlog;
  }

  async getBlogById(id: string | ObjectId) {
    return await this.blogModel.findById(id).exec();
  }

  async deleteBlogById(id: string | ObjectId) {
    const blog = this.getBlogById(id);
    if (!blog) {
      throw new NotFoundException();
    }
    return this.blogModel.findByIdAndDelete(id);
  }

  async changeBlog(dto: ICreateBlog & { id: string | ObjectId }) {
    const blog = (await this.blogModel.findById(dto.id)) as Blog;
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.save();
    return;
  }

  async changeBlogsUser(id: string | ObjectId, userId: string | ObjectId) {
    await this.blogModel.findByIdAndUpdate(id, {
      userId,
    });

    return;
  }

  async getPostsForBlogId(
    queryParams: GetAllPostsdDto,
    blogId: string,
    userId: string,
  ) {
    const currentBlog = await this.getBlogById(blogId);
    if (!currentBlog) {
      throw new NotFoundException();
    }
    return this.postsQueryRepository.queryAllPostsPagination(
      queryParams,
      blogId,
      userId,
    );
  }

  async getAllBlogsSa(
    queryParams: GetAllBlogsQueryDto,
  ): Promise<IPaginationResponse<IBlog>> {
    const namePart = new RegExp(queryParams.searchNameTerm, 'i');
    const sortValue = queryParams.sortDirection || 'desc';
    const filter = {
      name: namePart,
    };

    const allBlogs: IBlog[] = (
      await this.blogModel
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
        blogOwnerInfo: {
          userId: i.userId,
          userLogin: 'string',
        },
      };
    });

    const totalCount = await this.blogModel.find(filter).exec();
    const paginationParams: paramsDto = {
      totalCount: totalCount.length,
      pageSize: queryParams.pageSize,
      pageNumber: queryParams.pageNumber,
    };
    return {
      ...paginationBuilder(paginationParams),
      items: allBlogs,
    };
  }
}
