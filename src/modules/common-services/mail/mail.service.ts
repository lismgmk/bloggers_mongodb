import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendUserConfirmation(
    user: { email: string; name: string },
    code: string,
  ) {
    const clientPort = this.configService.get<string>('CLIENT_PORT');
    const url = `http://localhost:${clientPort}/client-confirm?code=${code}`;
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Welcome to Lis App! Confirm your Email',
        html: ` <h1>Password recovery</h1>
       <p>To finish password recovery please follow the link below:
          <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a>
      </p>`,
        text: 'https://somesite.com/password-recovery?recoveryCode=${code}',
        context: {
          name: user.name,
          url,
        },
      });
    } catch (e) {
      return new BadRequestException(e);
    }
  }
}
