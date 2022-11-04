import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';
import { CheckExpirationCode } from '../../../dto-validator/check-expiration-code';

export class CodeAuthDto {
  @CheckExpirationCode()
  @IsDate()
  @Type(() => Date)
  readonly code: Date;
}
