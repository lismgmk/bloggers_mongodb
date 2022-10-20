import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { Blogs, BlogsSchema } from 'schemas/blogs.schema';
import { BasicStrategy } from 'strategyes/auth-basic.strategy';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';
import { GetBlogsHandler } from './queries/handler/get-blogs.handler';

@Module({
  imports: [
    PassportModule,
    MongooseModule.forFeature([{ name: Blogs.name, schema: BlogsSchema }]),
    CqrsModule,
  ],
  controllers: [BlogsController],
  providers: [BlogsService, BasicStrategy, GetBlogsHandler],
})
export class BlogsModule {}
