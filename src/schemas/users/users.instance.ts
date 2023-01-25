import { Types } from 'mongoose';

export class EmailConfirmationMain {
  confirmationCode: string;
  expirationDate: string;
  isConfirmed: boolean;
  attemptCount: number;
}

export class AccountDataMain {
  userName: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  // userIp: string;
}

export class BanInfoMain {
  isBanned: boolean;
  banDate: string;
  banReason: string;
}

export class BanInfoBloggerMain extends BanInfoMain {
  blogId: Types.ObjectId;
}

export class UserMain {
  accountData: AccountDataMain;
  emailConfirmation: EmailConfirmationMain;
  banInfoSa: BanInfoMain;
  // banInfoBlogger: BanInfoBloggerMain[] | [] = [];
}
