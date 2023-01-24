import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import {
  FIELD_REQUIRED_VALIDATION_ERROR,
  FIELD_LENGTH_VALIDATION_ERROR_SHORT,
  FIELD_LENGTH_VALIDATION_ERROR_LONG,
  FIELD_EMAIL_VALIDATION_ERROR,
} from '../../consts/ad-validation-const';
import {
  AccountDataMain,
  BanInfoBloggerMain,
  BanInfoMain,
  EmailConfirmationMain,
  UserMain,
} from './users.instance';

@Schema({ _id: false })
class EmailConfirmation extends Document implements EmailConfirmationMain {
  @Prop({
    type: String,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
    // unique: true,
  })
  confirmationCode: string;
  @Prop({
    type: String,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  expirationDate: string;
  @Prop({
    type: Boolean,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  isConfirmed: boolean;
  @Prop({
    type: Number,
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  attemptCount: number;
}

@Schema({ _id: false })
class BanInfoBlogger extends Document implements BanInfoBloggerMain {
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
}
@Schema({ _id: false })
class BanInfoSa extends Document implements BanInfoMain {
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
}

@Schema({ _id: false })
class AccountData extends Document implements AccountDataMain {
  @Prop({
    type: String,
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
    required: [true, FIELD_REQUIRED_VALIDATION_ERROR],
  })
  createdAt: string;
}

@Schema({ expires: 'user' })
export class User extends Document implements UserMain {
  @Prop({ type: AccountData, required: true })
  accountData: AccountData;
  @Prop({ type: EmailConfirmation, required: true })
  emailConfirmation: EmailConfirmation;
  @Prop({ type: BanInfoSa, required: true })
  banInfoSa: BanInfoSa;
  @Prop({ type: BanInfoBlogger, required: true })
  banInfoBlogger: BanInfoBlogger[];
}

export const UserSchema = SchemaFactory.createForClass(User);
