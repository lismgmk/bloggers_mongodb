import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { IPaginationResponse } from 'global-dto/common-interfaces';
import { GetAllPostsdDto } from 'modules/posts/dto/get-all-posts.dto';
import { PostsQueryRepository } from 'modules/posts/posts.query.repository';
import { Model, ObjectId } from 'mongoose';
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
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  async getAllBlogs(
    queryParams: GetAllBlogsQueryDto,
  ): Promise<IPaginationResponse<IBlog>> {
    return await this.queryBus.execute(queryParams);
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

  async getBlogById(id: string | ObjectId) {
    return await this.blogModel.findById(id).exec();
  }

  async deleteBlogById(id: string | ObjectId) {
    return this.blogModel.findByIdAndDelete(id);
  }

  async changeBlog(dto: CreateBlogDto & { id: string }) {
    const blog = (await this.blogModel.findById(dto.id)) as Blog;
    blog.name = dto.name;
    blog.youtubeUrl = dto.youtubeUrl;
    blog.save();
    return;
  }

  async getPostsForBlogId(queryParams: GetAllPostsdDto, id: string) {
    const currentBlog = this.getBlogById(id);
    if (!currentBlog) {
      throw new NotFoundException();
    }
    return this.postsQueryRepository.queryAllPostsPagination(
      queryParams,
      'None',
      id,
    );
  }
}
