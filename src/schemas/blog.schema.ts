import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { FIELD_REQUIRED_VALIDATION_ERROR } from '../consts/ad-validation-const';

@Schema({ expires: 'blog' })
export class Blog extends Document {
  @Prop({ required: [true, FIELD_REQUIRED_VALIDATION_ERROR], type: String })
  name: string;
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
  youtubeUrl: string;
  @Prop({
    type: String,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  createdAt: string;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
