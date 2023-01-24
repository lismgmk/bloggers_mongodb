import { Transform, TransformFnParams } from 'class-transformer';
import { Length, Matches } from 'class-validator';
import { FIELD_LENGTH_VALIDATION_ERROR } from '../../../consts/ad-validation-const';

const urlRegEx =
  /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/;

export class CreateBlogDto {
  // @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(1, 15, { message: FIELD_LENGTH_VALIDATION_ERROR })
  readonly name: string;

  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(1, 100, { message: FIELD_LENGTH_VALIDATION_ERROR })
  readonly description: string;

  @Matches(urlRegEx)
  @Length(1, 100, { message: FIELD_LENGTH_VALIDATION_ERROR })
  readonly websiteUrl: string;

  // @IsMongoIdObject()
  // readonly userId: string;
}
