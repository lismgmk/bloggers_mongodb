import { UseFilters } from '@nestjs/common';
import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ValidationBodyExceptionFilter } from '../../exceptions/validation-body-exception-filter';

@Schema({ _id: false })
class EmailConfirmation extends Document {
  @Prop({
    validate: {
      validator: async function (v: string) {
        const regexExp =
          /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
        return regexExp.test(v);
      },
      message: (props) => `${props.value} is not a valid`,
    },
  })
  confirmationCode: string;
  @Prop()
  expirationDate: string;
  @Prop()
  isConfirmed: string;
  @Prop()
  attemptCount: string;
}
@UseFilters(new ValidationBodyExceptionFilter())
@Schema({ _id: false })
class AccountData extends Document {
  @Prop({
    type: String,
    unique: true,
    required: true,
  })
  userName: string;

  @Prop({ required: [true, 'email is required'] })
  email: string;
  @Prop({ required: [true, 'passwordHash is required'] })
  passwordHash: string;
  @Prop()
  createdAt: string;
  @Prop()
  userIp: string;
}
@Schema({ expires: 'users' })
export class User extends Document {
  @Prop({ type: AccountData })
  accountData: AccountData;
  @Prop({ type: EmailConfirmation })
  emailConfirmation: EmailConfirmation;
}

export const UserSchema = SchemaFactory.createForClass(User);
