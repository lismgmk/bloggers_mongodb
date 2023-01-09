import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isValid } from 'date-fns';
import { Model } from 'mongoose';
import { User } from '../schemas/users.schema';

@Injectable()
@ValidatorConstraint({ async: true })
export class IfConfirmedUserDropErrorValidator
  implements ValidatorConstraintInterface
{
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async validate(value: any, args: ValidationArguments) {
    if (args.property === 'code' || !isValid(value)) {
      return false;
    } else {
      let fieldName: string;
      let searchVal: string;
      if (args.property === 'code' || isValid(value)) {
        fieldName = `emailConfirmation.confirmationCode`;
        searchVal = value.toISOString();
      } else {
        fieldName = `accountData.email`;
        searchVal = value;
      }

      const fieldValue = { $eq: searchVal };
      const filter = { [fieldName]: fieldValue };
      const user = await this.userModel.findOne(filter).exec();
      return user ? !user.emailConfirmation.isConfirmed : false;
    }
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
