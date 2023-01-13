import { Module } from '@nestjs/common';
import { SaService } from './sa.service';
import { SaController } from './sa.controller';
import { BlogsService } from '../blogs/blogs.service';
import { BasicStrategy } from '../../strategyes/auth-basic.strategy';
import { GetBlogsHandler } from '../blogs/queries/handler/get-blogs.handler';
import { PostsQueryRepository } from '../posts/posts.query.repository';
import { PostsService } from '../posts/posts.service';
import { CqrsModule } from '@nestjs/cqrs';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from '../../schemas/blog.schema';
import { Like, LikeSchema } from '../../schemas/likes.schema';
import { Posts, PostsSchema } from '../../schemas/posts.schema';
import { IfNotFoundBlogIdDropError } from '../../dto-validator/if-not-found-blog-id-drop-error';
import { LikesService } from '../likes/likes.service';
import { BlogsQueryRepository } from '../blogs/blogs.query.repository';

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
  controllers: [SaController],
  providers: [
    SaService,
    BlogsService,
    BasicStrategy,
    GetBlogsHandler,
    PostsQueryRepository,
    PostsService,
    LikesService,
    IfNotFoundBlogIdDropError,
    BlogsQueryRepository,
  ],
})
export class SaModule {}
