import { CreatePostDto } from './../posts/dto/create-post.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { GetAllBlogsQueryDto } from './queries/impl/get-all-blogs-query.dto';
import { GetUser } from '../../decorators/get-user.decorator';
import { MongoExceptionFilter } from '../../exceptions/mongoose-exception-filter';
import { ValidationBodyExceptionFilter } from '../../exceptions/validation-body-exception-filter';
import { ParamIdValidationPipe } from '../../pipes/param-id-validation.pipe';
import { CustomValidationPipe } from '../../pipes/validation.pipe';
import { User } from '../../schemas/users.schema';
import { GetAllPostsdDto } from '../posts/dto/get-all-posts.dto';
import { PostsService } from '../posts/posts.service';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
  ) {}

  @Get()
  @HttpCode(200)
  @UseFilters(new MongoExceptionFilter())
  async getAllBlogs(
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    queryParams: GetAllBlogsQueryDto,
  ) {
    return await this.blogsService.getAllBlogs(queryParams);
  }

  @Post()
  // @UseGuards(AuthGuard('basic'))
  @UseFilters(new MongoExceptionFilter())
  @UseFilters(new ValidationBodyExceptionFilter())
  async createUser(
    @Body(new CustomValidationPipe()) createBlogDto: CreateBlogDto,
  ) {
    return await this.blogsService.createBlog(createBlogDto);
  }

  @Get(':id')
  @HttpCode(200)
  @UseFilters(new MongoExceptionFilter())
  @UsePipes(new ValidationPipe({ transform: true }))
  async getBloggerById(
    @Param('id', ParamIdValidationPipe)
    blogId: string,
  ) {
    return await this.blogsService.getBlogById(blogId);
  }

  @Put(':id')
  @HttpCode(204)
  // @UseGuards(AuthGuard('basic'))
  @UseFilters(new MongoExceptionFilter())
  @UseFilters(new ValidationBodyExceptionFilter())
  async changeBlog(
    @Param('id', ParamIdValidationPipe)
    blogId: string,
    @Body(new CustomValidationPipe()) createBlogDto: CreateBlogDto,
  ) {
    return await this.blogsService.changeBlog({
      id: blogId,
      ...createBlogDto,
    });
  }

  @Delete(':id')
  @HttpCode(204)
  // @UseGuards(AuthGuard('basic'))
  @UseFilters(new MongoExceptionFilter())
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteBlog(
    @Param('id', ParamIdValidationPipe)
    blogId: string,
  ) {
    return await this.blogsService.deleteBlogById(blogId);
  }

  @Get(':blogId/posts')
  @HttpCode(200)
  @UseFilters(new MongoExceptionFilter())
  async getPostsForBloggerId(
    @Param('blogId', ParamIdValidationPipe)
    blogId: string,
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    queryParams: GetAllPostsdDto,
    @GetUser() user: User,
  ) {
    return await this.blogsService.getPostsForBlogId(
      queryParams,
      blogId,
      user ? user._id : null,
    );
  }

  @Post(':blogId/posts')
  @HttpCode(201)
  @UseGuards(AuthGuard('basic'))
  @UseFilters(new MongoExceptionFilter())
  @UseFilters(new ValidationBodyExceptionFilter())
  async createPostsForBloggerId(
    @Param('blogId', ParamIdValidationPipe)
    blogId: string,
    @Body(new CustomValidationPipe())
    createPostDto: CreatePostDto,
  ) {
    return await this.postsService.createPost({
      ...createPostDto,
      blogId,
    });
  }
}
