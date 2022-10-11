import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { FIELD_REQUIRED_VALIDATION_ERROR } from '../consts/ad-validation-const';

@Schema({ expires: 'blackList' })
export class BlackList extends Document {
  @Prop({
    type: String,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
    // unique: true,
  })
  tokenValue: string;
}

export const BlackListSchema = SchemaFactory.createForClass(BlackList);
