import {
  Controller,
  Put,
  HttpCode,
  UseFilters,
  UseGuards,
  Param,
  Body,
  Delete,
  UsePipes,
  ValidationPipe,
  Get,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { GetUser } from '../../decorators/get-user.decorator';
import { MongoExceptionFilter } from '../../exceptions/mongoose-exception-filter';
import { ValidationBodyExceptionFilter } from '../../exceptions/validation-body-exception-filter';
import { LikeStatusDto } from '../../global-dto/like-status.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ParamIdValidationPipe } from '../../pipes/param-id-validation.pipe';
import { CustomValidationPipe } from '../../pipes/validation.pipe';
import { User } from '../../schemas/users/users.schema';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Put(':commentId/like-status')
  @HttpCode(204)
  @SkipThrottle()
  @UseFilters(new ValidationBodyExceptionFilter())
  @UseFilters(new MongoExceptionFilter())
  @UseGuards(JwtAuthGuard)
  async addLikeStatuseComment(
    @Param('commentId', ParamIdValidationPipe)
    commentId: string,
    @GetUser()
    user: User,
    @Body(new CustomValidationPipe())
    likeStatus: LikeStatusDto,
  ) {
    return await this.commentsService.addLikeStatuseComment(
      user,
      likeStatus.likeStatus,
      commentId,
    );
  }

  @Put(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @UseFilters(new MongoExceptionFilter())
  @UseFilters(new ValidationBodyExceptionFilter())
  async changeComment(
    @Param('id', ParamIdValidationPipe)
    id: string,
    @Body(new CustomValidationPipe())
    content: CreateCommentDto,
    @GetUser() user: User,
  ) {
    return await this.commentsService.changeComment(
      id,
      content.content,
      user._id,
    );
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @UseFilters(new MongoExceptionFilter())
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteBlog(
    @Param('id', ParamIdValidationPipe)
    id: string,
    @GetUser() user: User,
  ) {
    return await this.commentsService.deleteCommentById(id, user._id);
  }

  @Get(':id')
  @HttpCode(200)
  @UseFilters(new MongoExceptionFilter())
  async getPostById(
    @Param('id', ParamIdValidationPipe)
    id: string,
    @GetUser() user: User,
  ) {
    return this.commentsService.getCommentByIdWithLikes(
      id,
      user ? user._id : null,
    );
  }
}
