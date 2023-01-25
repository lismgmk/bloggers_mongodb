import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Model } from 'mongoose';
import { Blog } from '../schemas/blog/blog.schema';

@Injectable()
@ValidatorConstraint({ async: true })
export class IfNotFoundBlogIdDropError implements ValidatorConstraintInterface {
  constructor(@InjectModel(Blog.name) private blogModel: Model<Blog>) {}

  async validate(value: any) {
    const blog = await this.blogModel.findById(value).exec();
    return !!blog;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.value} is already taken!`;
  }
}

export function ForUnExistsIdBlogError(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IfNotFoundByIdDropError',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IfNotFoundBlogIdDropError,
    });
  };
}
