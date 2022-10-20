import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { SendEmailEvent } from 'modules/auth/events/impl/send-email.event';
import { UsersService } from 'modules/users/users.service';
import { v4 } from 'uuid';
import { RegistrationCommand } from '../impl/registration.command';

@CommandHandler(RegistrationCommand)
export class RegistrationHandler
  implements ICommandHandler<RegistrationCommand>
{
  constructor(
    private usersService: UsersService,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: RegistrationCommand) {
    const confirmationCode = v4();
    const newUserDto = {
      login: command.login,
      email: command.email,
      password: command.password,
      userIp: command.userIp,
    };
    const mail = this.publisher.mergeObjectContext(
      new SendEmailEvent(command.email, command.login, confirmationCode),
    );
    mail.commit();
    await this.usersService.createUser(newUserDto);
  }
}
