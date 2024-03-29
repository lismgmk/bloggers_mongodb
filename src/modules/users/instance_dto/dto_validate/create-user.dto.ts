import { Transform, TransformFnParams } from 'class-transformer';
import { Length, IsEmail } from 'class-validator';
import {
  FIELD_EXIST_VALIDATION_ERROR,
  FIELD_LENGTH_VALIDATION_ERROR,
  FIELD_EMAIL_VALIDATION_ERROR,
} from '../../../../consts/ad-validation-const';
import { ForExistsUserError } from '../../../../dto-validator/if-exist-user-drop-error';
import { CreateUserMain } from '../main_instance/create-user.instance';

export class CreateUserDto implements CreateUserMain {
  @ForExistsUserError({
    message: FIELD_EXIST_VALIDATION_ERROR,
  })
  @Length(3, 10)
  readonly login: string;

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(6, 20, { message: FIELD_LENGTH_VALIDATION_ERROR })
  readonly password: string;

  @ForExistsUserError({
    message: FIELD_EXIST_VALIDATION_ERROR,
  })
  @IsEmail({ message: FIELD_EMAIL_VALIDATION_ERROR })
  readonly email: string;
}
