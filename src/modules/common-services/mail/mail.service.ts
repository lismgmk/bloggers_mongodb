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
        html: ` 
                 <a href=https://somesite.com/password-recovery?recoveryCode=${code}>https://somesite.com/password-recovery?recoveryCode=${code}</a>
      `,
        // template: './confirmation', // `.hbs` extension is appended automatically
        context: {
          // ✏️ filling curly brackets with content
          name: user.name,
          url,
        },
      });
    } catch (e) {
      return new BadRequestException(e);
    }
  }
}
