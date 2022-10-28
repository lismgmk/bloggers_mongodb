import { Length } from 'class-validator';

export class CreateCommentDto {
  @Length(1, 1000)
  readonly content: string;
}
