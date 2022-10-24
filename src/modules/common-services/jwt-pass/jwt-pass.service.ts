import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ObjectId } from 'mongoose';

@Injectable()
export class JwtPassService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  verifyJwt(token: string) {
    return this.jwtService.verify(token);
  }
  decodeJwt(token: string) {
    return this.jwtService.decode(token);
  }

  async createPassBcrypt(password: string) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }
  async checkPassBcrypt(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  async createJwt(id: ObjectId, expiresIn: string) {
    const secret = this.configService.get<string>('SECRET');
    const payload = { id };
    return this.jwtService.sign(payload, { secret, expiresIn });
  }
}
