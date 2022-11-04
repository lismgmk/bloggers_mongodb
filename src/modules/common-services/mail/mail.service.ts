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
    code: Date,
  ) {
    const clientPort = this.configService.get<string>('CLIENT_PORT');
    const url = `http://localhost:${clientPort}/client-confirm?code=${code}`;
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Welcome to Lis App! Confirm your Email',
        html: `<h1>this is a test mail.<a href=${clientPort}>Confirm here</a></h1>`,
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
