import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { add, compareDesc } from 'date-fns';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsExpired implements ValidatorConstraintInterface {
  async validate(value: any) {
    if (
      compareDesc(
        new Date(),
        add(new Date(value), {
          seconds: 10,
        }),
      ) === -1
    ) {
      return false;
    } else {
      return true;
    }
  }
}

export function CheckExpirationCode(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'checkExpiration',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: IsExpired,
    });
  };
}
