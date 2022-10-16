import { IsEmail } from 'class-validator';
import { FIELD_EMAIL_VALIDATION_ERROR } from '../../../consts/ad-validation-const';

export class ResendingEmailDto {
  @IsEmail({ message: FIELD_EMAIL_VALIDATION_ERROR })
  readonly email: string;
}
