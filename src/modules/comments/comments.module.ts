import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { Comments, CommentsSchema } from '../../schemas/comments/comments.schema';
import { Like, LikeSchema } from '../../schemas/likes.schema';
import { Posts, PostsSchema } from '../../schemas/posts/posts.schema';
import { LikesService } from '../likes/likes.service';
import { CommentsController } from './comments.controller';
import { CommentsQueryRepository } from './comments.query.repository';
import { CommentsService } from './comments.service';

@Module({
  imports: [
    PassportModule,
    MongooseModule.forFeature([
      { name: Posts.name, schema: PostsSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Comments.name, schema: CommentsSchema },
    ]),
  ],
  providers: [CommentsService, LikesService, CommentsQueryRepository],
  controllers: [CommentsController],
})
export class CommentsModule {}
