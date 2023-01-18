import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
import { MongoExceptionFilter } from '../../exceptions/mongoose-exception-filter';
import { ValidationBodyExceptionFilter } from '../../exceptions/validation-body-exception-filter';
import { ParamIdValidationPipe } from '../../pipes/param-id-validation.pipe';
import { CustomValidationPipe } from '../../pipes/validation.pipe';
import { BlogsService } from '../blogs/blogs.service';
import { GetAllBlogsQueryDto } from '../blogs/queries/impl/get-all-blogs-query.dto';
import { BanUserDto } from '../users/instance_dto/dto_validate/ban-user.dto';
import { CreateUserDto } from '../users/instance_dto/dto_validate/create-user.dto';
import { GetAllUsersQueryDto } from '../users/instance_dto/dto_validate/get-all-user-query.dto';
import { IdParamDTO } from '../users/instance_dto/id-param.dto';
import { UsersService } from '../users/users.service';
import { SaService } from './sa.service';

@Controller('sa')
export class SaController {
  constructor(
    private readonly sa: SaService,
    private readonly blogsService: BlogsService,
    private readonly usersService: UsersService,
  ) {}

  @Put('/blogs/:blogId/bind-with-user/:userId')
  @HttpCode(204)
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
    return await this.sa.getAllBlogsSa(queryParams);
  }

  @Post('/users')
  @UseGuards(AuthGuard('basic'))
  @UseFilters(new MongoExceptionFilter())
  @UseFilters(new ValidationBodyExceptionFilter())
  async createUser(
    @Body(new CustomValidationPipe()) createUserDto: CreateUserDto,
  ) {
    return await this.usersService.createUser(createUserDto);
  }

  @HttpCode(204)
  @Put('/users/:id/ban')
  @UseGuards(AuthGuard('basic'))
  @UseFilters(new MongoExceptionFilter())
  @UseFilters(new ValidationBodyExceptionFilter())
  async banUser(
    @Param('id', ParamIdValidationPipe)
    id: string,
    @Body(new CustomValidationPipe()) banDto: BanUserDto,
  ) {
    await this.sa.changeBanStatus(id, banDto);
    return;
  }

  @Get('users')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseFilters(new MongoExceptionFilter())
  async getAllUsers(@Query() queryParams: GetAllUsersQueryDto) {
    return await this.sa.getAllUsers(queryParams);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(AuthGuard('basic'))
  @UseFilters(new MongoExceptionFilter())
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteUser(@Param() id: IdParamDTO) {
    return await this.usersService.deleteUserById(id.id);
  }
}
