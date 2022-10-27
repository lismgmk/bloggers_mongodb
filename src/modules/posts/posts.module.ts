import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { IfNotFoundBlogIdDropError } from 'dto-validator/if-not-found-blog-id-drop-error';
import { LikesService } from 'modules/likes/likes.service';
import { Blog, BlogSchema } from 'schemas/blog.schema';
import { Like, LikeSchema } from 'schemas/likes.schema';
import { Posts, PostsSchema } from 'schemas/posts.schema';
import { BlogsService } from './../blogs/blogs.service';
import { PostsController } from './posts.controller';
import { PostsQueryRepository } from './posts.query.repository';
import { PostsService } from './posts.service';

@Module({
  imports: [
    CqrsModule,
    PassportModule,
    MongooseModule.forFeature([
      { name: Posts.name, schema: PostsSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Like.name, schema: LikeSchema },
    ]),
  ],
  providers: [
    PostsService,
    BlogsService,
    IfNotFoundBlogIdDropError,
    LikesService,
    PostsQueryRepository,
  ],
  controllers: [PostsController],
})
export class PostsModule {}
