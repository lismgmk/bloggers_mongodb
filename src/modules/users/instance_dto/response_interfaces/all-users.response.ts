import { BanInfoMain } from '../../../../schemas/users/users.instance';

export interface IUserResponse {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  banInfo: BanInfoMain;
}
