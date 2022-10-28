import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import {
  FIELD_REQUIRED_VALIDATION_ERROR,
  INCORRECT_TYPE_VALIDATION_ERROR,
} from '../consts/ad-validation-const';

enum LikeStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

@Schema({ expires: 'like' })
export class Like extends Document {
  @Prop({
    type: String,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  createdAt: string;

  @Prop({
    type: String,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
    enum: [LikeStatus, INCORRECT_TYPE_VALIDATION_ERROR],
  })
  status: string;

  @Prop({
    type: String,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  login: string;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Comment',
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  commentId: Types.ObjectId;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Post',
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  postId: Types.ObjectId;

  @Prop({
    type: SchemaTypes.ObjectId,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  userId: Types.ObjectId;
}

export const LikeSchema = SchemaFactory.createForClass(Like);
