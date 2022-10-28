import { UsersRepository } from '../modules/users/users.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';
import { Model } from 'mongoose';
import { User } from '../schemas/users.schema';

@Injectable()
@ValidatorConstraint({ async: true })
export class IfNotFoundUserIdDropError implements ValidatorConstraintInterface {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private usersRepository: UsersRepository,
  ) {}

  async validate(value: any) {
    const count = await this.usersRepository.getUserById(value);
    if (!count) {
      throw new NotFoundException();
    } else {
      return true;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.value} is already taken`;
  }
}

export function ForUnExistsIdUserError(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IfNotFoundByIdDropError',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IfNotFoundUserIdDropError,
    });
  };
}
