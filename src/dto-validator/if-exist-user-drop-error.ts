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
import { User } from '../schemas/users/users.schema';

@Injectable()
@ValidatorConstraint({ name: 'UniqueValidator', async: true })
export class IfExistUserDropErrorValidator
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
    const count = await this.userModel.find(filter);
    return !count.length;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.value} is already taken`;
  }
}

export function ForExistsUserError(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IfExistUserDropErrorValidator',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IfExistUserDropErrorValidator,
    });
  };
}
