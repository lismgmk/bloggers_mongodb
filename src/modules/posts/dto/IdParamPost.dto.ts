import { ObjectId } from 'mongoose';
import { IsMongoIdObject } from 'dto-validator/is-mongid-obj';

export class IdParamPostDTO {
  @IsMongoIdObject()
  id: string;
}
