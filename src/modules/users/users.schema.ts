import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

class AccountData extends Document {
  @Prop()
  userName: string;
  @Prop()
  email: string;
  @Prop()
  passwordHash: string;
  @Prop()
  createdAt: string;
  @Prop()
  userIp: string;
}

class EmailConfirmation extends Document {
  @Prop()
  confirmationCode: string;
  @Prop()
  expirationDate: string;
  @Prop()
  isConfirmed: string;
  @Prop()
  attemptCount: string;
}

@Schema()
export class User extends Document {
  @Prop({ type: AccountData })
  accountData: AccountData;
  @Prop({ type: EmailConfirmation })
  emailConfirmation: EmailConfirmation;
}

export const UserSchema = SchemaFactory.createForClass(User);
