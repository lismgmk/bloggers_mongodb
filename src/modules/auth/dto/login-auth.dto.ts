import { Transform, TransformFnParams } from 'class-transformer';
import { Length } from 'class-validator';
import { FIELD_LENGTH_VALIDATION_ERROR } from '../../../consts/ad-validation-const';

export class LoginAuthDto {
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(3, 10)
  readonly loginOrEmail: string;

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(6, 20, { message: FIELD_LENGTH_VALIDATION_ERROR })
  readonly password: string;
}
