import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { IfNotFoundBlogIdDropError } from '../../dto-validator/if-not-found-blog-id-drop-error';
import { Blog, BlogSchema } from '../../schemas/blog.schema';
import {
  Comments,
  CommentsSchema,
} from '../../schemas/comments/comments.schema';
import { Like, LikeSchema } from '../../schemas/likes.schema';
import { Posts, PostsSchema } from '../../schemas/posts/posts.schema';
import { User, UserSchema } from '../../schemas/users/users.schema';
import { BasicStrategy } from '../../strategyes/auth-basic.strategy';
import { JwtStrategy } from '../../strategyes/jwt.strategy';
import { BlogsQueryRepository } from '../blogs/blogs.query.repository';
import { BlogsService } from '../blogs/blogs.service';
import { CommentsQueryRepository } from '../comments/comments.query.repository';
import { CommentsService } from '../comments/comments.service';
import { JwtPassService } from '../common-services/jwt-pass-custom/jwt-pass.service';
import { LikesService } from '../likes/likes.service';
import { UsersQueryRepository } from '../users/users.query.repository';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';
import { PostsController } from './posts.controller';
import { PostsQueryRepository } from './posts.query.repository';
import { PostsService } from './posts.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
    PassportModule,
    MongooseModule.forFeature([
      { name: Posts.name, schema: PostsSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Comments.name, schema: CommentsSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [
    BasicStrategy,
    JwtStrategy,
    CommentsService,
    PostsService,
    BlogsService,
    IfNotFoundBlogIdDropError,
    LikesService,
    PostsQueryRepository,
    UsersRepository,
    CommentsQueryRepository,
    UsersService,
    JwtPassService,
    UsersQueryRepository,
    JwtService,
    BlogsQueryRepository,
  ],
  controllers: [PostsController],
})
export class PostsModule {}
