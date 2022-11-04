import { IsEmail } from 'class-validator';

export class ResendingEmailDto {
  @IsEmail()
  readonly email: string;
}
