import { IsMongoIdObject } from 'dto-validator/is-mongid-obj';

export class IdBlogParamDTO {
  @IsMongoIdObject()
  // @ForUnExistsIdBlogError()
  blogId: string;
}
