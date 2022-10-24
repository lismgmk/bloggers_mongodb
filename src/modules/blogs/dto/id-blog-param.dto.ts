import { ForUnExistsIdBlogError } from 'dto-validator/if-not-found-blog-id-drop-error';
import { IsMongoIdObject } from 'dto-validator/is-mongid-obj';

export class IdBlogParamDTO {
  @IsMongoIdObject()
  @ForUnExistsIdBlogError()
  id: string;
}
