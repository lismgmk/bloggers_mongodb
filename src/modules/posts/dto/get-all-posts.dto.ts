import { IsEnum, IsOptional } from 'class-validator';
import { INCORRECT_TYPE_VALIDATION_ERROR } from '../../../consts/ad-validation-const';
import { PaginationQueryDto } from '../../../global-dto/dto_validate/pagination-query.dto';

export enum SortByFieldPost {
  createdAt,
  title,
  shortDescription,
  content,
  blogName,
}

export class GetAllPostsdDto extends PaginationQueryDto {
  @IsEnum(SortByFieldPost, { message: INCORRECT_TYPE_VALIDATION_ERROR })
  @IsOptional()
  readonly sortBy: keyof typeof SortByFieldPost = 'createdAt';
}
