import { IsEmail } from 'class-validator';
import { FIELD_EPSENT_VALIDATION_ERROR } from '../../../consts/ad-validation-const';
import { ForEpsentUserError } from '../../../dto-validator/if-epsent-user-drop-error';

export class ResendingEmailDto {
  @ForEpsentUserError({
    message: FIELD_EPSENT_VALIDATION_ERROR,
  })
  @IsEmail()
  readonly email: string;
}
