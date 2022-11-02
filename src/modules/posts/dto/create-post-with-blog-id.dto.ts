import { IsMongoIdObject } from '../../../dto-validator/is-mongid-obj';
import { CreatePostDto } from './create-post.dto';

export class CreatePostWithBlogIdDto extends CreatePostDto {
  @IsMongoIdObject()
  readonly blogId: string;
}
