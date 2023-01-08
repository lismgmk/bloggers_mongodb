import { IsEmail } from 'class-validator';
import {
  FIELD_CONFIRMATION_ERROR,
  FIELD_EPSENT_VALIDATION_ERROR,
} from '../../../consts/ad-validation-const';
import { ForConfirmedUserError } from '../../../dto-validator/if-confirmed-user-drop-error';
import { ForEpsentUserError } from '../../../dto-validator/if-epsent-user-drop-error';

export class ResendingEmailDto {
  @ForConfirmedUserError({ message: FIELD_CONFIRMATION_ERROR })
  @ForEpsentUserError({
    message: FIELD_EPSENT_VALIDATION_ERROR,
  })
  @IsEmail()
  readonly email: string;
}
