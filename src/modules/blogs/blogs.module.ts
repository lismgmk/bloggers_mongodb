import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { IfNotFoundBlogIdDropError } from '../../dto-validator/if-not-found-blog-id-drop-error';
import {
  BanInfoBlogger,
  BanInfoBloggerSchema,
} from '../../schemas/banBlogger/ban-blogger.schema';
import { Blog, BlogSchema } from '../../schemas/blog/blog.schema';
import {
  Comments,
  CommentsSchema,
} from '../../schemas/comments/comments.schema';
import { Like, LikeSchema } from '../../schemas/likes.schema';
import { Posts, PostsSchema } from '../../schemas/posts/posts.schema';
import { User, UserSchema } from '../../schemas/users/users.schema';
import { BasicStrategy } from '../../strategyes/auth-basic.strategy';
import { CommentsQueryRepository } from '../comments/comments.query.repository';
import { CommentsService } from '../comments/comments.service';
import { JwtPassService } from '../common-services/jwt-pass-custom/jwt-pass.service';
import { LikesService } from '../likes/likes.service';
import { PostsQueryRepository } from '../posts/posts.query.repository';
import { PostsService } from '../posts/posts.service';
import { UsersQueryRepository } from '../users/users.query.repository';
import { UsersService } from '../users/users.service';
import { BlogsController } from './blogs.controller';
import { BlogsQueryRepository } from './blogs.query.repository';
import { BlogsService } from './blogs.service';
import { GetBlogsHandler } from './queries/handler/get-blogs.handler';

@Module({
  imports: [
    PassportModule,
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Posts.name, schema: PostsSchema },
      { name: Like.name, schema: LikeSchema },
      { name: User.name, schema: UserSchema },
      { name: Comments.name, schema: CommentsSchema },
      { name: BanInfoBlogger.name, schema: BanInfoBloggerSchema },
    ]),
    CqrsModule,
  ],
  controllers: [BlogsController],
  providers: [
    BlogsService,
    BasicStrategy,
    GetBlogsHandler,
    PostsQueryRepository,
    PostsService,
    LikesService,
    IfNotFoundBlogIdDropError,
    BlogsQueryRepository,
    UsersService,
    UsersQueryRepository,
    JwtPassService,
    JwtService,
    CommentsService,
    CommentsQueryRepository,
  ],
})
export class BlogsModule {}
