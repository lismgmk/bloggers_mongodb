import { Injectable, NotFoundException } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BlogsService } from './../modules/blogs/blogs.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class IfNotFoundBlogIdDropError implements ValidatorConstraintInterface {
  constructor(private blogsService: BlogsService) {}

  async validate(value: any) {
    console.log('validation');
    let count;
    if (value) {
      count = await this.blogsService.getBlogById(value);
    }
    if (!count || !value) {
      throw new NotFoundException();
    } else {
      return true;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.value} is already taken`;
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
