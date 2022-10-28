import { Length } from 'class-validator';

export class CreatePostDto {
  @Length(1, 30)
  readonly title: string;

  @Length(1, 100)
  readonly shortDescription: string;

  @Length(1, 1000)
  readonly content: string;
}
