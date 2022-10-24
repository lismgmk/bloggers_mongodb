import { AggregateRoot } from '@nestjs/cqrs';

export class RegistrationCommand extends AggregateRoot {
  constructor(
    public readonly login: string,
    public readonly password: string,
    public readonly email: string,
    public readonly userIp: string,
  ) {
    super();
  }
}
