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
import { MongoExceptionFilter } from 'exceptions/mongoose-exception-filter';
import { ValidationBodyExceptionFilter } from 'exceptions/validation-body-exception-filter';
import { CustomValidationPipe } from 'pipes/validation.pipe';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { IdBlogParamDTO } from './dto/id-blog-param.dto';
import { GetAllBlogsQueryDto } from './queries/impl/get-all-blogs-query.dto';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

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
  @UseGuards(AuthGuard('basic'))
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
  async getBloggerById(@Param() id: IdBlogParamDTO) {
    return await this.blogsService.getBlogById(id.id);
  }

  @Put(':id')
  @HttpCode(204)
  @UseGuards(AuthGuard('basic'))
  @UseFilters(new MongoExceptionFilter())
  @UseFilters(new ValidationBodyExceptionFilter())
  async changeBlog(
    @Param(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    id: IdBlogParamDTO,
    @Body(new CustomValidationPipe()) createBlogDto: CreateBlogDto,
  ) {
    return await this.blogsService.changeBlog({ id: id.id, ...createBlogDto });
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(AuthGuard('basic'))
  @UseFilters(new MongoExceptionFilter())
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteBlog(@Param() id: IdBlogParamDTO) {
    return await this.blogsService.deleteBlogById(id.id);
  }

  @Get('/:bloggerId/posts')
  @HttpCode(200)
  @UseFilters(new MongoExceptionFilter())
  @UsePipes(new ValidationPipe({ transform: true }))
  async getPostsForBloggerId(@Param() bloggerId: IdBlogParamDTO) {
    // return await this.blogsService.getPostsForBloggerId(bloggerId.id);
  }
}
