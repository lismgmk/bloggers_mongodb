import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class CustomValidationPipe implements PipeTransform<any> {
  async transform(value: string, argumentMetadata: ArgumentMetadata) {
    if (
      !argumentMetadata.metatype ||
      !this.toValidate(argumentMetadata.metatype)
    ) {
      return value;
    } else {
      if (argumentMetadata.type === 'body') {
        const object = plainToInstance(argumentMetadata.metatype, value);
        const errors = await validate(object);
        const errorsArr = errors.map((el) => {
          return { message: el.constraints, field: el.property };
        });
        if (errors.length > 0) {
          throw new BadRequestException(errorsArr);
        }
      }
    }
    return value;
  }

  toValidate(metatype): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
