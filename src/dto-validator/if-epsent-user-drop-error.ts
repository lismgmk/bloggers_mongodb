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
export class IfEpsentUserDropErrorValidator
  implements ValidatorConstraintInterface
{
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async validate(value: any, args: ValidationArguments) {
    let fieldName: string;
    if (args.property === 'login') {
      fieldName = `accountData.userName`;
    } else {
      fieldName = `accountData.${args.property}`;
    }
    const fieldValue = { $eq: value };
    const filter = { [fieldName]: fieldValue };
    const user = await this.userModel.findOne(filter).exec();
    return !!user;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.value} is already taken`;
  }
}

export function ForEpsentUserError(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IfEpsentUserDropErrorValidator',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IfEpsentUserDropErrorValidator,
    });
  };
}
