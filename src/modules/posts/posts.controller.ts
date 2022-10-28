import {
  Body,
  Controller,
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
import { GetUser } from 'decorators/get-user.decorator';
import { CommonErrorFilter } from 'exceptions/common-error-filter';
import { MongoExceptionFilter } from 'exceptions/mongoose-exception-filter';
import { ValidationBodyExceptionFilter } from 'exceptions/validation-body-exception-filter';
import { LikeStatusDto } from 'global-dto/like-status.dto';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { IdBlogParamDTO } from 'modules/blogs/dto/id-blog-param.dto';
import { CommentsService } from 'modules/comments/comments.service';
import { CreateCommentDto } from 'modules/comments/dto/create-comment.dto';
import { CustomValidationPipe } from 'pipes/validation.pipe';
import { User } from 'schemas/users.schema';
import { CreatePostWithBlogIdDto } from './dto/create-post-with-blog-id.dto';
import { GetAllPostsdDto } from './dto/get-all-posts.dto';
import { IdParamPostDTO } from './dto/IdParamPost.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
  ) {}

  @Get()
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseFilters(new MongoExceptionFilter())
  async getAllPosts(@Query() queryParams: GetAllPostsdDto) {
    return await this.postsService.getAllPosts(queryParams);
  }

  @Post()
  @UseGuards(AuthGuard('basic'))
  @UseFilters(new MongoExceptionFilter())
  @UseFilters(new ValidationBodyExceptionFilter())
  async createUser(
    @Body(new CustomValidationPipe())
    createPostDto: CreatePostWithBlogIdDto,
  ) {
    return await this.postsService.createPost(createPostDto);
  }

  @Put(':postId/like-status')
  @HttpCode(204)
  @UseFilters(new ValidationBodyExceptionFilter())
  @UseFilters(new MongoExceptionFilter())
  @UseGuards(JwtAuthGuard)
  async addLikeStatusePost(
    @Param(
      new ValidationPipe({
        transform: true,
      }),
    )
    postId: IdParamPostDTO,
    @GetUser(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    user: User,
    @Body(new CustomValidationPipe())
    likeStatus: LikeStatusDto,
  ) {
    return await this.postsService.addLikeStatusePost(
      user,
      likeStatus.likeStatus,
      postId.postId,
    );
  }

  // @Get(':blogId/posts')
  // @HttpCode(200)
  // @UseFilters(new MongoExceptionFilter())
  // async getPostsForBloggerId(
  //   @Param(
  //     new ValidationPipe({
  //       transform: true,
  //     }),
  //   )
  //   blogId: IdBlogParamDTO,
  //   @Query(
  //     new ValidationPipe({
  //       transform: true,
  //       transformOptions: { enableImplicitConversion: true },
  //     }),
  //   )
  //   queryParams: GetAllPostsdDto,
  // ) {
  //   return await this.blogsService.getPostsForBlogId(
  //     queryParams,
  //     blogId.blogId,
  //   );
  // }

  @Post(':postId/comments')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  @UseFilters(new CommonErrorFilter())
  @UseFilters(new MongoExceptionFilter())
  @UseFilters(new ValidationBodyExceptionFilter())
  async createPostsForBloggerId(
    @Param(
      new ValidationPipe({
        transform: true,
      }),
    )
    postId: IdBlogParamDTO,
    @Body(new CustomValidationPipe())
    content: CreateCommentDto,
    @GetUser() user: User,
  ) {
    return await this.commentsService.createComment({
      postId: postId.blogId,
      ...content,
      userId: user._id,
      userLogin: user.accountData.userName,
    });
  }
}
