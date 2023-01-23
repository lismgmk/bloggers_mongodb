import {
  Controller,
  Get,
  HttpCode,
  UsePipes,
  ValidationPipe,
  UseFilters,
  Post,
  UseGuards,
  Body,
  Put,
  Param,
  Delete,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SkipThrottle } from '@nestjs/throttler';
import { GetUser } from '../../decorators/get-user.decorator';
import { CommonErrorFilter } from '../../exceptions/common-error-filter';
import { MongoExceptionFilter } from '../../exceptions/mongoose-exception-filter';
import { ValidationBodyExceptionFilter } from '../../exceptions/validation-body-exception-filter';
import { LikeStatusDto } from '../../global-dto/like-status.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ParamIdValidationPipe } from '../../pipes/param-id-validation.pipe';
import { CustomValidationPipe } from '../../pipes/validation.pipe';
import { User } from '../../schemas/users/users.schema';
import { CommentsService } from '../comments/comments.service';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';
import { GetAllCommentsDto } from '../comments/instance_dto/dto_validate/get-all-comments.dto';
import { UsersService } from '../users/users.service';
import { CreatePostWithBlogIdDto } from './instance_dto/dto_validate/create-post-with-blog-id.dto';
import { GetAllPostsdDto } from './instance_dto/dto_validate/get-all-posts.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseFilters(new MongoExceptionFilter())
  async getAllPosts(
    @Query() queryParams: GetAllPostsdDto,
    @GetUser()
    user: User,
  ) {
    return await this.postsService.getAllPosts(
      queryParams,
      user ? user._id : null,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseFilters(new MongoExceptionFilter())
  @UseFilters(new ValidationBodyExceptionFilter())
  async createPost(
    @Body(new CustomValidationPipe())
    createPostDto: CreatePostWithBlogIdDto,
    @GetUser()
    user: User,
  ) {
    return await this.postsService.createPost({
      ...createPostDto,
      userId: user._id,
    });
  }

  @Put(':postId/like-status')
  @HttpCode(204)
  @UseFilters(new ValidationBodyExceptionFilter())
  @UseFilters(new MongoExceptionFilter())
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  async addLikeStatusePost(
    @Param('postId', ParamIdValidationPipe)
    postId: string,
    @GetUser()
    user: User,
    @Body(new CustomValidationPipe())
    likeStatus: LikeStatusDto,
  ) {
    const post = await this.postsService.getPostById(postId);
    if (!post) {
      throw new NotFoundException();
    }
    return await this.postsService.addLikeStatusePost(
      user,
      likeStatus.likeStatus,
      postId,
    );
  }

  @Get(':postId/comments')
  @HttpCode(200)
  @SkipThrottle()
  @UseFilters(new MongoExceptionFilter())
  async getPostsForBloggerId(
    @Param('postId', ParamIdValidationPipe)
    postId: string,
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    queryParams: GetAllCommentsDto,
    @GetUser() user: User,
  ) {
    const post = await this.postsService.getPostById(postId);
    if (!post) {
      throw new NotFoundException();
    }
    await this.usersService.chechUserBan(post.userId.toString());
    return this.commentsService.getCommentsForPostId(
      queryParams,
      postId,
      user ? user._id : null,
    );
  }

  @Get(':postId')
  @HttpCode(200)
  @UseFilters(new MongoExceptionFilter())
  async getPostById(
    @Param('postId', ParamIdValidationPipe)
    postId: string,
    // @GetUser() user: User,
  ) {
    const post = await this.postsService.getPostById(postId);
    if (!post) {
      throw new NotFoundException();
    }
    await this.usersService.chechUserBan(post.userId.toString());
    return this.postsService.getPostByIdWithLikes(postId);
  }

  @Post(':postId/comments')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  @UseFilters(new CommonErrorFilter())
  @UseFilters(new MongoExceptionFilter())
  @UseFilters(new ValidationBodyExceptionFilter())
  async createCommentForPostId(
    @Param('postId', ParamIdValidationPipe)
    postId: string,
    @Body(new CustomValidationPipe())
    content: CreateCommentDto,
    @GetUser() user: User,
  ) {
    const post = await this.postsService.getPostById(postId);
    if (!post) {
      throw new NotFoundException();
    }

    return await this.commentsService.createComment({
      postId,
      ...content,
      userId: user ? user._id : null,
      userLogin: user.accountData.userName,
      blogId: post.blogId.toString(),
    });
  }

  @Put(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @UseFilters(new MongoExceptionFilter())
  @UseFilters(new ValidationBodyExceptionFilter())
  async changeBlog(
    @Param('id', ParamIdValidationPipe)
    id: string,
    @Body(new CustomValidationPipe())
    createPostDto: CreatePostWithBlogIdDto,
    @GetUser()
    user: User,
  ) {
    const post = await this.postsService.getPostById(id);
    if (!post) {
      throw new NotFoundException();
    }
    return await this.postsService.changePost(id, {
      ...createPostDto,
      userId: user._id,
    });
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(AuthGuard('basic'))
  @UseFilters(new MongoExceptionFilter())
  @UsePipes(new ValidationPipe({ transform: true }))
  async deletePost(
    @Param('id', ParamIdValidationPipe)
    id: string,
  ) {
    const post = await this.postsService.getPostById(id);
    if (!post) {
      throw new NotFoundException();
    }
    return await this.postsService.deletePostById(id);
  }
}
