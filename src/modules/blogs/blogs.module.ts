import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { Blog, BlogSchema } from 'schemas/blog.schema';
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
    ]),
    CqrsModule,
  ],
  controllers: [BlogsController],
  providers: [BlogsService, BasicStrategy, GetBlogsHandler],
})
export class BlogsModule {}
