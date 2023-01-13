import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  Query,
  UseFilters,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../../decorators/get-user.decorator';
import { MongoExceptionFilter } from '../../exceptions/mongoose-exception-filter';
import { ValidationBodyExceptionFilter } from '../../exceptions/validation-body-exception-filter';
import { ParamIdValidationPipe } from '../../pipes/param-id-validation.pipe';
import { User } from '../../schemas/users.schema';
import { BlogsService } from '../blogs/blogs.service';
import { GetAllBlogsQueryDto } from '../blogs/queries/impl/get-all-blogs-query.dto';
import { SaService } from './sa.service';

@Controller('sa')
export class SaController {
  constructor(
    private readonly sa: SaService,
    private readonly blogsService: BlogsService,
  ) {}

  @Put('/blogs/:blogId/bind-with-user/:userId')
  @HttpCode(201)
  @UseGuards(AuthGuard('basic'))
  @UseFilters(new MongoExceptionFilter())
  @UseFilters(new ValidationBodyExceptionFilter())
  async changePostsForBloggerId(
    @Param('blogId', ParamIdValidationPipe)
    blogId: string,
    @Param('userId', ParamIdValidationPipe)
    userId: string,
  ) {
    const blog = await this.blogsService.getBlogById(blogId);
    if (!blog) {
      throw new NotFoundException();
    }
    if (!Object.is(blog.userId, null)) {
      throw new BadRequestException([
        { message: 'user is setted', field: 'id' },
      ]);
    }
    return await this.blogsService.changeBlogsUser(blogId, userId);
  }

  @Get('/blogs')
  @HttpCode(200)
  @UseFilters(new MongoExceptionFilter())
  @UseGuards(AuthGuard('basic'))
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
    // return await this.blogsService.getAllBlogsSa(queryParams);
    return await this.sa.getAllBlogsSa(queryParams);
  }
}
