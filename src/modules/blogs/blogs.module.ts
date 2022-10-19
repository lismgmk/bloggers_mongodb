import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { Blogs, BlogsSchema } from 'schemas/blogs.schema';
import { BasicStrategy } from 'strategyes/auth-basic.strategy';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';

@Module({
  imports: [
    PassportModule,
    MongooseModule.forFeature([{ name: Blogs.name, schema: BlogsSchema }]),
  ],
  controllers: [BlogsController],
  providers: [BlogsService, BasicStrategy],
})
export class BlogsModule {}
