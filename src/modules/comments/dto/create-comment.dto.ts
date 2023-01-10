import { Transform, TransformFnParams } from 'class-transformer';
import { Length } from 'class-validator';

export class CreateCommentDto {
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(20, 300)
  readonly content: string;
}
