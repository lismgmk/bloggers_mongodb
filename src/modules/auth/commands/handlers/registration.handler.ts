import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '../../../users/users.service';
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
    const newUserDto = {
      login: command.login,
      email: command.email,
      password: command.password,
      userIp: command.userIp,
      confirmationCode: new Date().toISOString(),
    };
    // const mail = this.eventPublisher.mergeObjectContext(
    //   new SendEmailEvent(command.email, command.login, confirmationCode),
    // );
    // mail.startSend();
    // mail.commit();
    await this.usersService.createUser(newUserDto);
  }
}
