import { BlogsService } from './blogs.service';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { GetAllBlogsQueryDto } from './dto/get-all-blogs-query.dto';
import { AuthGuard } from '@nestjs/passport';
import { MongoExceptionFilter } from 'exceptions/mongoose-exception-filter';
import { ValidationBodyExceptionFilter } from 'exceptions/validation-body-exception-filter';
import { CustomValidationPipe } from 'pipes/validation.pipe';
import { CreateBlogDto } from './dto/create-blog.dto';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get()
  @HttpCode(200)
  // @UseGuards(AuthGuard('basic'))
  @UseFilters(new MongoExceptionFilter())
  async getAllBlogs(@Query() queryParams: GetAllBlogsQueryDto) {
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
}
