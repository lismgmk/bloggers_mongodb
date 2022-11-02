import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { IfNotFoundBlogIdDropError } from '../../dto-validator/if-not-found-blog-id-drop-error';
import { Blog, BlogSchema } from '../../schemas/blog.schema';
import { Comments, CommentsSchema } from '../../schemas/comments.schema';
import { Like, LikeSchema } from '../../schemas/likes.schema';
import { Posts, PostsSchema } from '../../schemas/posts.schema';
import { User, UserSchema } from '../../schemas/users.schema';
import { JwtStrategy } from '../../strategyes/jwt.strategy';
import { BlogsService } from '../blogs/blogs.service';
import { CommentsQueryRepository } from '../comments/comments.query.repository';
import { CommentsService } from '../comments/comments.service';
import { LikesService } from '../likes/likes.service';
import { UsersRepository } from '../users/users.repository';
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
    JwtStrategy,
    CommentsService,
    PostsService,
    BlogsService,
    IfNotFoundBlogIdDropError,
    LikesService,
    PostsQueryRepository,
    UsersRepository,
    CommentsQueryRepository,
  ],
  controllers: [PostsController],
})
export class PostsModule {}
