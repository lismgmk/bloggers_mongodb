import { BlackList, BlackListSchema } from './../../schemas/black-list.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from 'schemas/blog.schema';
import { Comments, CommentsSchema } from 'schemas/comments.schema';
import { Like, LikeSchema } from 'schemas/likes.schema';
import { Posts, PostsSchema } from 'schemas/posts.schema';
import { User, UserSchema } from 'schemas/users.schema';
import { TestingController } from './testing.controller';
import { TestingService } from './testing.service';
import { IpUser, IpUserSchema } from 'schemas/iPusers.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Posts.name, schema: PostsSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Comments.name, schema: CommentsSchema },
      { name: User.name, schema: UserSchema },
      { name: BlackList.name, schema: BlackListSchema },
      { name: IpUser.name, schema: IpUserSchema },
    ]),
  ],
  controllers: [TestingController],
  providers: [TestingService],
})
export class TestingModule {}
