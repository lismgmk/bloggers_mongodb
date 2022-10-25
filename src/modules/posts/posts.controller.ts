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
import { MongoExceptionFilter } from 'exceptions/mongoose-exception-filter';
import { ValidationBodyExceptionFilter } from 'exceptions/validation-body-exception-filter';
import { LikeStatusDto } from 'global-dto/like-status.dto';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { CustomValidationPipe } from 'pipes/validation.pipe';
import { User } from 'schemas/users.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { GetAllPostsdDto } from './dto/get-all-posts.dto';
import { IdParamPostDTO } from './dto/IdParamPost.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

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
    createBlogDto: CreatePostDto,
  ) {
    return await this.postsService.createPost(createBlogDto);
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
}
