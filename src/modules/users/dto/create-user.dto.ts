import { Length, IsEmail } from 'class-validator';
import { ForExistsUserError } from 'src/dto-validator/if-exist-user-drop-error';
import {
  FIELD_EXIST_VALIDATION_ERROR,
  FIELD_LENGTH_VALIDATION_ERROR,
  FIELD_EMAIL_VALIDATION_ERROR,
} from '../../../consts/ad-validation-const';

export class CreateUserDto {
  @ForExistsUserError({
    message: FIELD_EXIST_VALIDATION_ERROR,
  })
  @Length(3, 10)
  readonly login: string;

  @Length(6, 20, { message: FIELD_LENGTH_VALIDATION_ERROR })
  readonly password: string;

  @ForExistsUserError({
    message: FIELD_EXIST_VALIDATION_ERROR,
  })
  @IsEmail({ message: FIELD_EMAIL_VALIDATION_ERROR })
  readonly email: string;
}
