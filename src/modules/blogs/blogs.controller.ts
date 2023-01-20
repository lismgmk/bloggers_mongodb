import { CreatePostDto } from '../posts/instance_dto/dto_validate/create-post.dto';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
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
import { User } from '../../schemas/users/users.schema';
import { GetAllPostsdDto } from '../posts/instance_dto/dto_validate/get-all-posts.dto';
import { PostsService } from '../posts/posts.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('/blogger/blogs/')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
  ) {}

  @Get()
  @HttpCode(200)
  @UseFilters(new MongoExceptionFilter())
  @UseGuards(JwtAuthGuard)
  async getAllBlogs(
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    queryParams: GetAllBlogsQueryDto,
    @GetUser()
    user: User,
  ) {
    return await this.blogsService.getAllBlogs(
      queryParams,
      user ? user._id : 'None',
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseFilters(new MongoExceptionFilter())
  @UseFilters(new ValidationBodyExceptionFilter())
  async createBlog(
    @Body(new CustomValidationPipe()) createBlogDto: CreateBlogDto,
    @GetUser()
    user: User,
  ) {
    return await this.blogsService.createBlog({
      ...createBlogDto,
      userId: user._id,
    });
  }

  @Get(':id')
  @HttpCode(200)
  @UseFilters(new MongoExceptionFilter())
  @UsePipes(new ValidationPipe({ transform: true }))
  async getBloggerById(
    @Param('id', ParamIdValidationPipe)
    blogId: string,
  ) {
    const blog = await this.blogsService.getBlogById(blogId);
    if (!blog) {
      throw new NotFoundException();
    }
    return {
      id: blog._id,
      name: blog.name,
      websiteUrl: blog.websiteUrl,
      description: blog.description,
      createdAt: blog.createdAt,
    };
  }

  @Put(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @UseFilters(new MongoExceptionFilter())
  @UseFilters(new ValidationBodyExceptionFilter())
  async changeBlog(
    @Param('id', ParamIdValidationPipe)
    blogId: string,
    @Body(new CustomValidationPipe()) createBlogDto: CreateBlogDto,
    @GetUser()
    user: User,
  ) {
    const blog = await this.blogsService.getBlogById(blogId);
    if (!blog) {
      throw new NotFoundException();
    }
    if (blog.userId !== user._id) {
      throw new ForbiddenException();
    }
    return await this.blogsService.changeBlog({
      id: blogId,
      ...createBlogDto,
    });
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @UseFilters(new MongoExceptionFilter())
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteBlog(
    @Param('id', ParamIdValidationPipe)
    blogId: string,
    @GetUser()
    user: User,
  ) {
    const blog = await this.blogsService.getBlogById(blogId);
    if (!blog) {
      throw new NotFoundException();
    }
    if (blog.userId !== user._id) {
      throw new ForbiddenException();
    }
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
    const blog = await this.blogsService.getBlogById(blogId);
    if (!blog) {
      throw new NotFoundException();
    }
    return await this.blogsService.getPostsForBlogId(
      queryParams,
      blogId,
      user ? user._id : null,
    );
  }

  @Post(':blogId/posts')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  @UseFilters(new MongoExceptionFilter())
  @UseFilters(new ValidationBodyExceptionFilter())
  async createPostsForBloggerId(
    @Param('blogId', ParamIdValidationPipe)
    blogId: string,
    @Body(new CustomValidationPipe())
    createPostDto: CreatePostDto,
    @GetUser()
    user: User,
  ) {
    const blog = await this.blogsService.getBlogById(blogId);
    if (!blog) {
      throw new NotFoundException();
    }
    if (blog.userId !== user._id) {
      throw new ForbiddenException();
    }
    return await this.postsService.createPost({
      ...createPostDto,
      blogId,
      userId: user._id,
    });
  }

  @Put(':blogId/posts/:postId')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  @UseFilters(new MongoExceptionFilter())
  @UseFilters(new ValidationBodyExceptionFilter())
  async changePostsForBloggerId(
    @Param('blogId', ParamIdValidationPipe)
    blogId: string,
    @Param('postId', ParamIdValidationPipe)
    postId: string,
    @Body(new CustomValidationPipe())
    createPostDto: CreatePostDto,
    @GetUser()
    user: User,
  ) {
    const blog = await this.blogsService.getBlogById(blogId);
    if (!blog) {
      throw new NotFoundException();
    }
    if (blog.userId !== user._id) {
      throw new ForbiddenException();
    }
    return await this.postsService.changePost(postId, {
      ...createPostDto,
      blogId,
      userId: user._id,
    });
  }
}
