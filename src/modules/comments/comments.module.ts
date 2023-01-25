import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { BanInfoBlogger, BanInfoBloggerSchema } from '../../schemas/banBlogger/ban-blogger.schema';
import {
  Comments,
  CommentsSchema,
} from '../../schemas/comments/comments.schema';
import { Like, LikeSchema } from '../../schemas/likes.schema';
import { Posts, PostsSchema } from '../../schemas/posts/posts.schema';
import { User, UserSchema } from '../../schemas/users/users.schema';
import { JwtPassService } from '../common-services/jwt-pass-custom/jwt-pass.service';
import { LikesService } from '../likes/likes.service';
import { UsersQueryRepository } from '../users/users.query.repository';
import { UsersService } from '../users/users.service';
import { CommentsController } from './comments.controller';
import { CommentsQueryRepository } from './comments.query.repository';
import { CommentsService } from './comments.service';

@Module({
  imports: [
    PassportModule,
    MongooseModule.forFeature([
      { name: Posts.name, schema: PostsSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Comments.name, schema: CommentsSchema },
      { name: User.name, schema: UserSchema },
      { name: BanInfoBlogger.name, schema: BanInfoBloggerSchema },
    ]),
  ],
  providers: [
    CommentsService,
    LikesService,
    CommentsQueryRepository,
    UsersService,
    JwtPassService,
    UsersQueryRepository,
    JwtService,
  ],
  controllers: [CommentsController],
})
export class CommentsModule {}
