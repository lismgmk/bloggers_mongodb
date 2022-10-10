import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { FIELD_REQUIRED_VALIDATION_ERROR } from '../consts/ad-validation-const';

@Schema({ expires: 'ipUsers' })
export class IpUser extends Document {
  @Prop({
    type: Date,
    unique: true,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  createdAt: Date;
  @Prop({
    type: String,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  userIp: string;
  @Prop({
    type: String,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  path: string;
}

export const IpUserSchema = SchemaFactory.createForClass(IpUser);
