import { Injectable } from '@nestjs/common';
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
export class IfConfirmedUserDropErrorValidator
  implements ValidatorConstraintInterface
{
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async validate(value: any, args: ValidationArguments) {
    let fieldName: string;
    let searchVal: string;
    if (args.property === 'code') {
      fieldName = `emailConfirmation.confirmationCode`;
      searchVal = value.toISOString();
    } else {
      fieldName = `accountData.email`;
      searchVal = value;
    }
    const fieldValue = { $eq: searchVal };
    const filter = { [fieldName]: fieldValue };
    const user = await this.userModel.findOne(filter).exec();
    return !user.emailConfirmation.isConfirmed;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.value} is already taken`;
  }
}

export function ForConfirmedUserError(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IfEpsentUserDropErrorValidator',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IfConfirmedUserDropErrorValidator,
    });
  };
}
