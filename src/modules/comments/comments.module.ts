import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { LikesService } from 'modules/likes/likes.service';
import { Like, LikeSchema } from 'schemas/likes.schema';
import { Posts, PostsSchema } from 'schemas/posts.schema';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comments, CommentsSchema } from 'schemas/comments.schema';

@Module({
  imports: [
    PassportModule,
    MongooseModule.forFeature([
      { name: Posts.name, schema: PostsSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Comments.name, schema: CommentsSchema },
    ]),
  ],
  providers: [CommentsService, LikesService],
  controllers: [CommentsController],
})
export class CommentsModule {}
