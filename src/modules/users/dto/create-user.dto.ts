import { Length, IsEmail } from 'class-validator';
import {
  FIELD_EXIST_VALIDATION_ERROR,
  FIELD_LENGTH_VALIDATION_ERROR,
  FIELD_EMAIL_VALIDATION_ERROR,
} from '../../../consts/ad-validation-const';
import { ForExistsUserError } from '../../../dto-validator/if-exist-user-drop-error';

export class CreateUserDto {
  // @ForExistsUserError({
  //   message: FIELD_EXIST_VALIDATION_ERROR,
  // })
  @Length(3, 10)
  readonly login: string;

  @Length(6, 20, { message: FIELD_LENGTH_VALIDATION_ERROR })
  readonly password: string;

  // @ForExistsUserError({
  //   message: FIELD_EXIST_VALIDATION_ERROR,
  // })
  @IsEmail({ message: FIELD_EMAIL_VALIDATION_ERROR })
  readonly email: string;
}
