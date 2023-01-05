import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { IPaginationResponse } from '../../global-dto/common-interfaces';
import { Blog } from '../../schemas/blog.schema';
import { GetAllPostsdDto } from '../posts/dto/get-all-posts.dto';
import { PostsQueryRepository } from '../posts/posts.query.repository';
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
    // const count = (a, b) => {
    //   return a + b;
    // };

    // const promisify = (a, b) => {
    //   return new Promise((res, rej) => {
    //     res(count(a, b));
    //   });
    // };

    // const res = await promisify(2, 2).then((res: number) => res ** 2);

    return await this.queryBus.execute(queryParams);
  }

  async createBlog(dto: CreateBlogDto) {
    const newBlog = new this.blogModel({
      name: dto.name,
      websiteUrl: dto.websiteUrl,
      description: dto.description,
      createdAt: new Date().toISOString(),
    });
    try {
      const createdBlog = (await this.blogModel.create(newBlog)) as Blog;
      return {
        id: createdBlog._id.toString(),
        name: createdBlog.name,
        websiteUrl: createdBlog.websiteUrl,
        description: createdBlog.description,
        createdAt: createdBlog.createdAt,
      } as IBlog;
    } catch (e) {
      console.log(e);
    }
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

  async changeBlog(dto: CreateBlogDto & { id: string }) {
    const blog = (await this.blogModel.findById(dto.id)) as Blog;
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.save();
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
}
