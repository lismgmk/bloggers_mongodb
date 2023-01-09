import { CreateUserDto } from './create-user.dto';

export interface IResponseCreateUser {
  id: string;
  login: string;
  email: string;
  createdAt: string;
}

export interface ICreatedUserDto extends CreateUserDto {
  userIp: string;
  confirmationCode: string;
  isConfirmed?: boolean;
}
