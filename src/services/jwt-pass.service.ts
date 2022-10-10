import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ObjectId } from 'mongoose';
import { UsersService } from '../modules/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class JwtPassService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  verifyJwt(token: string) {
    return this.jwtService.verify(token);
  }

  async checkPassBcrypt(password: string, hash: string) {
    const isMatch = await bcrypt.compare(password, hash);
    return await bcrypt.compare(password, hash);
  }

  async createJwt(id: ObjectId, expiresIn: string) {
    const secret = this.configService.get<string>('SECRET');

    const payload = { id };
    return this.jwtService.sign(payload, { secret });
  }
}
