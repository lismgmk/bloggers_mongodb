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
import { CreateUserDto } from './instance_dto/dto_validate/create-user.dto';
import { GetAllUsersQueryDto } from './instance_dto/get-all-user-query.dto';
import { IdParamDTO } from './instance_dto/id-param.dto';
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
    return await this.usersService.createUser(createUserDto);
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
    // return await this.usersService.getAllUsers(queryParams);
  }
}
