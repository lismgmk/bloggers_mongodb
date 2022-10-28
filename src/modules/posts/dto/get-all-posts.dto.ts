import { IsEnum, IsOptional } from 'class-validator';
import { INCORRECT_TYPE_VALIDATION_ERROR } from 'consts/ad-validation-const';
import { PaginationQueryDto } from 'global-dto/pagination-query.dto';

export enum SortByFieldPost {
  createdAt,
  title,
  shortDescription,
  content,
}

export class GetAllPostsdDto extends PaginationQueryDto {
  @IsEnum(SortByFieldPost, { message: INCORRECT_TYPE_VALIDATION_ERROR })
  @IsOptional()
  readonly sortBy: keyof typeof SortByFieldPost = 'createdAt';
}
