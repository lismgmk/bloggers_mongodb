import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs/dist/decorators/events-handler.decorator';
import { MailService } from 'modules/mail/mail.service';
import { SendEmailEvent } from '../impl/send-email.event';

@EventsHandler(SendEmailEvent)
export class SendEmailHandler implements IEventHandler<SendEmailEvent> {
  constructor(private mailService: MailService) {}

  async handle(event: SendEmailEvent) {
    await this.mailService.sendUserConfirmation(
      { email: event.email, name: event.name },
      event.confirmationCode,
    );
  }
}
