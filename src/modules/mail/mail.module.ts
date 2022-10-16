import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module, Global } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { MailService } from './mail.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MailerModule.forRootAsync({
      // imports: [ConfigModule], // import module if not enabled globally
      useFactory: async (configService: ConfigService) => ({
        // transport: config.get("MAIL_TRANSPORT"),
        // or
        transport: {
          service: 'gmail',
          auth: {
            user: configService.get<string>('GMAIL_SERVICE_EMAIL'),
            pass: configService.get<string>('GMAIL_SERVICE_PASS'),
          },

          // host: config.get('MAIL_HOST'),
          // secure: false,
        },
        defaults: {
          from: `"No Reply" <${configService.get('GMAIL_SERVICE_EMAIL')}>`,
          // to: email,
          // subject: 'Hello',
          // html: `<h1>this is a test mail.<a href=${clientSrc}>Confirm here</a></h1>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
