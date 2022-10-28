import { IsMongoIdObject } from 'dto-validator/is-mongid-obj';

export class IdParamPostDTO {
  @IsMongoIdObject()
  postId: string;
}
