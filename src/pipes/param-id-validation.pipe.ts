import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { FIELD_OBJECT_ID_VALIDATION_ERROR } from '../consts/ad-validation-const';

@Injectable()
export class ParamIdValidationPipe implements PipeTransform<any> {
  async transform(value: string, metadata: ArgumentMetadata) {
    // if (metadata.type != 'param') {
    //   return value;
    // }
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(FIELD_OBJECT_ID_VALIDATION_ERROR);
    }
    return value;
  }
}
