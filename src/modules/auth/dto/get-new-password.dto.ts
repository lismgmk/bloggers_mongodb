import { Type } from 'class-transformer';
import { IsDate, Length } from 'class-validator';
import { FIELD_LENGTH_VALIDATION_ERROR } from '../../../consts/ad-validation-const';
import { CheckExpirationCode } from '../../../dto-validator/check-expiration-code';

export class GetNewPasswordDto {
  @Length(6, 20, { message: FIELD_LENGTH_VALIDATION_ERROR })
  readonly newPassword: string;

  @CheckExpirationCode()
  @IsDate()
  @Type(() => Date)
  readonly recoveryCode: Date;
}
