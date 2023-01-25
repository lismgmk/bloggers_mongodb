import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { FIELD_REQUIRED_VALIDATION_ERROR } from '../../consts/ad-validation-const';
import { IBanInfo, IBlog } from './blog.schema.interface';

@Schema({ _id: false })
class BanInfo extends Document implements IBanInfo {
  @Prop({
    type: String,
    default: null,
  })
  banDate: string;

  @Prop({
    type: Boolean,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  isBanned: boolean;
}

@Schema({ expires: 'blog' })
export class Blog extends Document implements IBlog {
  @Prop({ required: [true, FIELD_REQUIRED_VALIDATION_ERROR], type: String })
  name: string;

  @Prop({ required: [true, FIELD_REQUIRED_VALIDATION_ERROR], type: String })
  description: string;

  @Prop({
    type: String,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
    validate: {
      validator: function (v: string) {
        return /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/.test(
          v,
        );
      },
      message: (props) => `${props.value} is not a valid url`,
    },
  })
  websiteUrl: string;

  @Prop({
    type: SchemaTypes.ObjectId,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  userId: Types.ObjectId;

  @Prop({
    type: String,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  createdAt: string;

  @Prop({ type: BanInfo, required: true })
  banInfo: BanInfo;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
