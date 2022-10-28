import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Like, LikeSchema } from 'schemas/likes.schema';
import { LikesService } from './likes.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
  ],
  controllers: [],
  providers: [LikesService],
})
export class LikesModule {}
