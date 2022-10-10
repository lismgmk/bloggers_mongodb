import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  // @InjectModel(User.name) private userModel: Model<User>, // private configService: ConfigService,
  // async createUser(dto: ICreatedUserDto) {
  //   const salt = await bcrypt.genSalt(10);
  //   const hashPassword = await bcrypt.hash(dto.password, salt);
  //   const confirmationCode = v4();
  //   const newUser = new this.userModel({
  //     accountData: {
  //       userName: dto.login,
  //       email: dto.email,
  //       passwordHash: hashPassword,
  //       createdAt: new Date(),
  //       userIp: dto.userIp,
  //     },
  //     emailConfirmation: {
  //       confirmationCode,
  //       expirationDate: add(new Date(), {
  //         hours: 1,
  //         minutes: 10,
  //       }),
  //       isConfirmed: true,
  //       attemptCount: 0,
  //     },
  //   });
  //   const createdUser = await this.userModel.create(newUser);
  //   return {
  //     id: createdUser._id.toString(),
  //     login: createdUser.accountData.userName,
  //     email: createdUser.accountData.email,
  //     createdAt: createdUser.accountData.createdAt,
  //   } as IResponseCreateUser;
  // }
  // async deleteUserById(id: string) {
  //   return this.userModel.findByIdAndDelete(id);
  // }
}
