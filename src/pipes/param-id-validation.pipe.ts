import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { User } from '../schemas/users.schema';

@Injectable()
export class ParamIdValidationPipe implements PipeTransform<any> {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  async transform(value: number, metadata: ArgumentMetadata) {
    if (!ObjectId.isValid(value)) {
      throw new NotFoundException('Value must be greater ten.');
    }
  }
  toValidate(metatype): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
