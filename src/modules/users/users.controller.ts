import {
  Controller,
  Post,
  UseGuards,
  UseFilters,
  Ip,
  Body,
  Delete,
  HttpCode,
  UsePipes,
  ValidationPipe,
  Param,
  Get,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MongoExceptionFilter } from '../../exceptions/mongoose-exception-filter';
import { ValidationBodyExceptionFilter } from '../../exceptions/validation-body-exception-filter';
import { CustomValidationPipe } from '../../pipes/validation.pipe';
import { CreateUserDto } from './dto/create-user.dto';
import { GetAllUsersQueryDto } from './dto/get-all-user-query.dto';
import { IdParamDTO } from './dto/id-param.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(AuthGuard('basic'))
  @UseFilters(new MongoExceptionFilter())
  @UseFilters(new ValidationBodyExceptionFilter())
  async createUser(
    @Ip() userIp: string,
    @Body(new CustomValidationPipe()) createUserDto: CreateUserDto,
  ) {
    const confirmationCode = new Date().toISOString();
    return await this.usersService.createUser({
      ...createUserDto,
      userIp,
      confirmationCode,
      isConfirmed: true,
    });
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(AuthGuard('basic'))
  @UseFilters(new MongoExceptionFilter())
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteUser(@Param() id: IdParamDTO) {
    return await this.usersService.deleteUserById(id.id);
  }

  @Get()
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseFilters(new MongoExceptionFilter())
  async getAllUsers(@Query() queryParams: GetAllUsersQueryDto) {
    return await this.usersService.getAllUsers(queryParams);
  }
}
