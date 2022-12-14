import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';
import { FIELD_CONFIRMATION_ERROR } from '../../../consts/ad-validation-const';
import { CheckExpirationCode } from '../../../dto-validator/check-expiration-code';
import { ForConfirmedUserError } from '../../../dto-validator/if-confirmed-user-drop-error';

export class CodeAuthDto {
  @ForConfirmedUserError({ message: FIELD_CONFIRMATION_ERROR })
  @CheckExpirationCode({ message: 'code is expired' })
  @Type(() => Date)
  @IsDate({ message: 'wrong format' })
  readonly code: Date;
}
