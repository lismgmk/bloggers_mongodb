export const newUserModel = {
  accountData: {
    userName: 'User-1',
    email: 'someemail-1@mail.mail',
    passwordHash: '123456',
    createdAt: new Date(),
    userIp: ':001',
  },
  emailConfirmation: {
    confirmationCode: '123456',
    expirationDate: new Date(),
    isConfirmed: true,
    attemptCount: 0,
  },
};
