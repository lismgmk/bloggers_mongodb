import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import {
  FIELD_LENGTH_VALIDATION_ERROR_LONG,
  FIELD_LENGTH_VALIDATION_ERROR_SHORT,
  FIELD_REQUIRED_VALIDATION_ERROR,
} from '../../consts/ad-validation-const';
import { BanInfoBloggerMain } from './ban-blogger.instance';

@Schema({ _id: false })
export class BanInfoBlogger extends Document implements BanInfoBloggerMain {
  @Prop({
    type: String,
    default: null,
  })
  banDate: string;
  @Prop({
    type: String,
    default: null,
  })
  banReason: string;
  @Prop({
    type: Boolean,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  isBanned: boolean;
  @Prop({
    type: SchemaTypes.ObjectId,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  blogId: Types.ObjectId;

  @Prop({
    type: SchemaTypes.ObjectId,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  userId: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    min: [3, FIELD_LENGTH_VALIDATION_ERROR_SHORT],
    max: [10, FIELD_LENGTH_VALIDATION_ERROR_LONG],
  })
  login: string;
}

export const BanInfoBloggerSchema =
  SchemaFactory.createForClass(BanInfoBlogger);
