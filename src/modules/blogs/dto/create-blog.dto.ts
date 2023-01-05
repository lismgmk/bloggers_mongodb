import { Length, Matches } from 'class-validator';
import { FIELD_LENGTH_VALIDATION_ERROR } from '../../../consts/ad-validation-const';

const urlRegEx =
  /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/;

export class CreateBlogDto {
  @Length(1, 15, { message: FIELD_LENGTH_VALIDATION_ERROR })
  readonly name: string;

  @Length(1, 100, { message: FIELD_LENGTH_VALIDATION_ERROR })
  readonly description: string;

  @Matches(urlRegEx)
  @Length(1, 100, { message: FIELD_LENGTH_VALIDATION_ERROR })
  readonly websiteUrl: string;
}
