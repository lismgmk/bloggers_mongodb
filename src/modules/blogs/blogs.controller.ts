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
import { CreatePostDto } from '../posts/instance_dto/dto_validate/create-post.dto';

import { GetUser } from '../../decorators/get-user.decorator';
import { MongoExceptionFilter } from '../../exceptions/mongoose-exception-filter';
import { ValidationBodyExceptionFilter } from '../../exceptions/validation-body-exception-filter';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ParamIdValidationPipe } from '../../pipes/param-id-validation.pipe';
import { CustomValidationPipe } from '../../pipes/validation.pipe';
import { User } from '../../schemas/users/users.schema';
import { CommentsService } from '../comments/comments.service';
import { GetAllCommentsDto } from '../comments/instance_dto/dto_validate/get-all-comments.dto';
import { GetAllPostsdDto } from '../posts/instance_dto/dto_validate/get-all-posts.dto';
import { PostsService } from '../posts/posts.service';
import { BanBlogDto } from '../users/instance_dto/dto_validate/ban-user.dto';
import { UsersService } from '../users/users.service';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { GetAllBlogsQueryDto } from './queries/impl/get-all-blogs-query.dto';

@Controller()
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
    private usersService: UsersService,
  ) {}

  @HttpCode(204)
  @Put('/blogger/users/:userId/ban')
  @UseGuards(JwtAuthGuard)
  @UseFilters(new MongoExceptionFilter())
  @UseFilters(new ValidationBodyExceptionFilter())
  async banUserBlogger(
    @Param('userId', ParamIdValidationPipe)
    userId: string,
    @Body(new CustomValidationPipe()) banDto: BanBlogDto,
    @GetUser()
    user: User,
  ) {
    await this._checkBlogUser(banDto.blogId, user._id);
    await this.usersService.changeBlogBanStatus(userId, banDto);
    return;
  }

  @Get('/blogger/users/blog/:blogId')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @UseFilters(new MongoExceptionFilter())
  @UseFilters(new ValidationBodyExceptionFilter())
  async getAllBannedUsersForBlog(
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    queryParams: GetAllBlogsQueryDto,
    @Param('blogId', ParamIdValidationPipe)
    blogId: string,
    @GetUser()
    user: User,
  ) {
    await this._checkBlogUser(blogId, user._id);
    return await this.usersService.getAllBlogsBannedUsersForBlog(
      queryParams,
      blogId,
    );
  }

  @Get('/blogs/')
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
    return await this.blogsService.getBlogs(queryParams);
  }

  @Get('/blogs/:blogId/posts')
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
  ) {
    return await this.blogsService.getPostsForBlogId(queryParams, blogId, null);
  }

  @Get('/blogs/:id')
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

  @Get('/blogger/blogs/')
  @HttpCode(200)
  @UseFilters(new MongoExceptionFilter())
  @UseGuards(JwtAuthGuard)
  async getAllBlogsForUser(
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
    return await this.blogsService.getAllBlogsForUser(queryParams, user._id);
  }

  @Get('/blogger/blogs/comments')
  @HttpCode(200)
  @UseFilters(new MongoExceptionFilter())
  @UseGuards(JwtAuthGuard)
  async getAllCommentsForAllPostsForAllUsersBlog(
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    queryParams: GetAllCommentsDto,
    @GetUser()
    user: User,
  ) {
    const usersBlogs = await this.blogsService.getAllUsersBlogsArr(user._id);
    return await this.commentsService.getAllCommentsForAllPostsForAllUsersBlog(
      queryParams,
      user._id,
      usersBlogs,
    );
  }

  @Post('/blogger/blogs/')
  @UseGuards(JwtAuthGuard)
  @UseFilters(new MongoExceptionFilter())
  @UseFilters(new ValidationBodyExceptionFilter())
  async createBloggerBlog(
    @Body(new CustomValidationPipe()) createBlogDto: CreateBlogDto,
    @GetUser()
    user: User,
  ) {
    return await this.blogsService.createBlog({
      ...createBlogDto,
      userId: user._id,
    });
  }

  @Put('/blogger/blogs/:id')
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
    await this._checkBlogUser(blogId, user._id);
    return await this.blogsService.changeBlog({
      id: blogId,
      ...createBlogDto,
    });
  }

  @Delete('/blogger/blogs/:id')
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
    await this._checkBlogUser(blogId, user._id);
    return await this.blogsService.deleteBlogById(blogId);
  }

  @Post('/blogger/blogs/:blogId/posts')
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
    await this._checkBlogUser(blogId, user._id);
    return await this.postsService.createPost({
      ...createPostDto,
      blogId,
      userId: user._id,
    });
  }

  @Put('/blogger/blogs/:blogId/posts/:postId')
  @HttpCode(204)
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
    await this._checkBlogUser(blogId, user._id);
    return await this.postsService.changePost(postId, {
      ...createPostDto,
      blogId,
      userId: user._id,
    });
  }

  @Delete('/blogger/blogs/:blogId/posts/:postId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @UseFilters(new MongoExceptionFilter())
  @UsePipes(new ValidationPipe({ transform: true }))
  async deletePost(
    @Param('blogId', ParamIdValidationPipe)
    blogId: string,
    @Param('postId', ParamIdValidationPipe)
    postId: string,
    @GetUser()
    user: User,
  ) {
    await this._checkBlogUser(blogId, user._id, postId);
    return await this.postsService.deletePostById(postId);
  }

  async _checkBlogUser(blogId: string, userId: string, postId?: string) {
    if (postId) {
      const post = await this.postsService.getPostById(postId);
      if (!post) {
        throw new NotFoundException();
      }
    }
    const blog = await this.blogsService.getBlogById(blogId);
    if (!blog) {
      throw new NotFoundException();
    }
    if (!blog.userId.equals(userId)) {
      throw new ForbiddenException();
    }
  }
}
