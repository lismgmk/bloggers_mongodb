import { AggregateRoot } from '@nestjs/cqrs';

export class SendEmailEvent extends AggregateRoot {
  constructor(
    public readonly email: string,
    public readonly name: string,
    public readonly confirmationCode: string,
  ) {
    super();
  }
}
