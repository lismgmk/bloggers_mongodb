import { AggregateRoot } from '@nestjs/cqrs';
import { SendEmailHandler } from '../handlers/send-email.handler';

export class SendEmailEvent extends AggregateRoot {
  constructor(
    public readonly email: string,
    public readonly name: string,
    public readonly confirmationCode: Date,
  ) {
    super();
  }
  startSend() {
    // logic
    this.apply(SendEmailHandler);
  }
}
