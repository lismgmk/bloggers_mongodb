import { UseFilters } from '@nestjs/common';
import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  FIELD_REQUIRED_VALIDATION_ERROR,
  FIELD_LENGTH_VALIDATION_ERROR_SHORT,
  FIELD_LENGTH_VALIDATION_ERROR_LONG,
  FIELD_EMAIL_VALIDATION_ERROR,
} from '../../consts/ad-validation-const';
import { ValidationBodyExceptionFilter } from '../../exceptions/validation-body-exception-filter';

@UseFilters(new ValidationBodyExceptionFilter())
@Schema({ _id: false })
class EmailConfirmation extends Document {
  @Prop({
    type: String,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
    unique: true,
  })
  confirmationCode: string;
  @Prop({
    type: String,
    unique: true,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  expirationDate: string;
  @Prop({
    type: Boolean,
    unique: true,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  isConfirmed: boolean;
  @Prop({
    type: Number,
    unique: true,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  attemptCount: number;
}

@UseFilters(new ValidationBodyExceptionFilter())
@Schema({ _id: false })
class AccountData extends Document {
  @Prop({
    type: String,
    unique: true,
    required: true,
    min: [3, FIELD_LENGTH_VALIDATION_ERROR_SHORT],
    max: [10, FIELD_LENGTH_VALIDATION_ERROR_LONG],
  })
  userName: string;

  @Prop({
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
    validate: {
      validator: async function (v: string) {
        return v
          .toLowerCase()
          .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          );
      },
      message: (props) => `${props.value} ${FIELD_EMAIL_VALIDATION_ERROR}`,
    },
  })
  email: string;

  @Prop({
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
    min: [6, FIELD_LENGTH_VALIDATION_ERROR_SHORT],
    max: [20, FIELD_LENGTH_VALIDATION_ERROR_LONG],
  })
  passwordHash: string;
  @Prop({
    type: String,
    unique: true,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  createdAt: string;
  @Prop({
    type: String,
    unique: true,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  userIp: string;
}

@UseFilters(new ValidationBodyExceptionFilter())
@Schema({ expires: 'users' })
export class User extends Document {
  @Prop({ type: AccountData, required: true })
  accountData: AccountData;
  @Prop({ type: EmailConfirmation, required: true })
  emailConfirmation: EmailConfirmation;
}

export const UserSchema = SchemaFactory.createForClass(User);
