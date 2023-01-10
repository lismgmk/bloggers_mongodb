import { Transform, TransformFnParams } from 'class-transformer';
import { Length } from 'class-validator';

export class CreateCommentDto {
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(1, 1000)
  readonly content: string;
}
