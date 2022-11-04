import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { Types } from 'mongoose';

@Injectable()
export class JwtPassService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async verifyJwt(token: string) {
    try {
      const secret = this.configService.get<string>('SECRET');
      const tokenId = await this.jwtService.verify(token, {
        publicKey: secret,
      });

      return tokenId;
    } catch (e) {
      console.log(e);
    }
  }
  async decodeJwt(token: string) {
    const decodeToken = (await this.jwtService.decode(token, {
      complete: true,
    })) as { payload: { id: string; deviceId: string } };
    return decodeToken.payload;
  }

  async createPassBcrypt(password: string) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }
  async checkPassBcrypt(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  async createJwtAccess(id: string, expiresIn: string) {
    const secret = this.configService.get<string>('SECRET');
    const payload = { id };
    return this.jwtService.sign(payload, { secret, expiresIn });
  }

  async createJwtRefresh(
    id: string,
    expiresIn: string,
    deviceId: Types.ObjectId | string,
  ) {
    const secret = this.configService.get<string>('SECRET');
    const payload = { id, deviceId };
    return this.jwtService.sign(payload, { secret, expiresIn });
  }
}
