import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { FIELD_REQUIRED_VALIDATION_ERROR } from '../consts/ad-validation-const';

@Schema({ expires: 'device' })
export class Devices extends Document {
  @Prop({
    type: Date,
    unique: true,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  createdAt: Date;
  @Prop({
    type: Date,
    unique: true,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  expiredAt: Date;

  @Prop({
    type: String,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  ip: string;

  @Prop({
    type: SchemaTypes.ObjectId,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  userId: Types.ObjectId;

  @Prop({
    type: String,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  deviceName: string;
}

export const DevicesSchema = SchemaFactory.createForClass(Devices);
