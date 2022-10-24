import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import {
  FIELD_LENGTH_VALIDATION_ERROR_LONG,
  FIELD_LENGTH_VALIDATION_ERROR_SHORT,
  FIELD_REQUIRED_VALIDATION_ERROR,
} from '../consts/ad-validation-const';

@Schema({ expires: 'posts' })
export class Posts extends Document {
  @Prop({
    type: String,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  createdAt: string;

  @Prop({
    min: [1, FIELD_LENGTH_VALIDATION_ERROR_SHORT],
    max: [100, FIELD_LENGTH_VALIDATION_ERROR_LONG],
    type: String,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  shortDescription: string;

  @Prop({
    type: String,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
    min: [1, FIELD_LENGTH_VALIDATION_ERROR_SHORT],
    max: [1000, FIELD_LENGTH_VALIDATION_ERROR_LONG],
  })
  content: string;

  @Prop({
    min: [1, FIELD_LENGTH_VALIDATION_ERROR_SHORT],
    max: [30, FIELD_LENGTH_VALIDATION_ERROR_LONG],
    type: String,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  title: string;

  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Blog',
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  blogId: Types.ObjectId;
}

export const PostsSchema = SchemaFactory.createForClass(Posts);
