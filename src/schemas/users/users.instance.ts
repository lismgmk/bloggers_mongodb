class EmailConfirmationMain {
  confirmationCode: string;
  expirationDate: string;
  isConfirmed: boolean;
  attemptCount: number;
}

class AccountDataMain {
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

export class UserMain {
  accountData: AccountDataMain;
  emailConfirmation: EmailConfirmationMain;
  banInfo: BanInfoMain;
}
