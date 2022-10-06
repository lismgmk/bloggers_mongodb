import { Length, IsEmail } from 'class-validator';
import {
  LOGIN_VALIDATION_ERROR,
  EMAIL_VALIDATION_ERROR,
} from '../../../dto-validator/ad-validation-const';
import { UserExists } from '../../../dto-validator/is-unique-user';

export class CreateUserDto {
  @UserExists({
    message: LOGIN_VALIDATION_ERROR,
  })
  @Length(3, 10)
  readonly login: string;

  @Length(6, 20)
  readonly password: string;

  @UserExists({
    message: EMAIL_VALIDATION_ERROR,
  })
  @IsEmail()
  readonly email: string;
}
