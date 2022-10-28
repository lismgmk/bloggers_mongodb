import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { LikesService } from 'modules/likes/likes.service';
import { PostsQueryRepository } from 'modules/posts/posts.query.repository';
import { PostsService } from 'modules/posts/posts.service';
import { Blog, BlogSchema } from 'schemas/blog.schema';
import { Like, LikeSchema } from 'schemas/likes.schema';
import { Posts, PostsSchema } from 'schemas/posts.schema';
import { BasicStrategy } from 'strategyes/auth-basic.strategy';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';
import { GetBlogsHandler } from './queries/handler/get-blogs.handler';

@Module({
  imports: [
    PassportModule,
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Posts.name, schema: PostsSchema },
      { name: Like.name, schema: LikeSchema },
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
  ],
})
export class BlogsModule {}
