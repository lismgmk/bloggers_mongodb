import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { FIELD_OBJECT_ID_VALIDATION_ERROR } from 'consts/ad-validation-const';
import { Types } from 'mongoose';

@Injectable()
export class ParamIdValidationPipe implements PipeTransform<any> {
  async transform(value: string, metadata: ArgumentMetadata) {
    if (metadata.type != 'param') {
      return value;
    }
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(FIELD_OBJECT_ID_VALIDATION_ERROR);
    }
    return value;
  }
}
