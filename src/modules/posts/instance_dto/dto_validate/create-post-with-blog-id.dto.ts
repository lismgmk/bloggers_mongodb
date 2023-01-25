import { FIELD_EPSENT_VALIDATION_ERROR } from '../../../../consts/ad-validation-const';
import { ForUnExistsIdBlogError } from '../../../../dto-validator/if-not-found-blog-id-drop-error';
import { IsMongoIdObject } from '../../../../dto-validator/is-mongid-obj';
import { CreatePostDto } from './create-post.dto';

export class CreatePostWithBlogIdDto extends CreatePostDto {
  @ForUnExistsIdBlogError({ message: FIELD_EPSENT_VALIDATION_ERROR })
  @IsMongoIdObject({ message: FIELD_EPSENT_VALIDATION_ERROR })
  readonly blogId: string;
}
