import { Length } from 'class-validator';
import { FIELD_LENGTH_VALIDATION_ERROR } from '../../../consts/ad-validation-const';

export class LoginAuthDto {
  @Length(3, 10)
  readonly login: string;

  @Length(6, 20, { message: FIELD_LENGTH_VALIDATION_ERROR })
  readonly password: string;
}
