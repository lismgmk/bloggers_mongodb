import { BadRequestException, Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import mongoose from 'mongoose';
import { FIELD_OBJECT_ID_VALIDATION_ERROR } from '../consts/ad-validation-const';

@Injectable()
@ValidatorConstraint({ async: true })
export class isMongoObjIdValidator implements ValidatorConstraintInterface {
  async validate(value: any) {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new BadRequestException({
        message: FIELD_OBJECT_ID_VALIDATION_ERROR,
      });
    } else {
      return true;
    }
  }
}

export function IsMongoIdObject(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsMongoIdObject',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: isMongoObjIdValidator,
    });
  };
}
