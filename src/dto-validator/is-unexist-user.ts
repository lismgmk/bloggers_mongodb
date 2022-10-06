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
import { User } from '../modules/users/users.schema';

@Injectable()
@ValidatorConstraint({ async: true })
export class UnExistValidator implements ValidatorConstraintInterface {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async validate(value: any, args: ValidationArguments) {
    const filter = {};
    filter[args.property] = value;
    const count = await this.userModel.findOne(filter);
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

export function UserUnExists(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'UserExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: UnExistValidator,
    });
  };
}
