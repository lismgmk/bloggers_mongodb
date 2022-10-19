import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'global-dto/pagination-query.dto';
import { INCORRECT_TYPE_VALIDATION_ERROR } from '../../../consts/ad-validation-const';

export enum SortByField {
  name,
  createdAt,
  youtubeUrl,
}

export class GetAllBlogsQueryDto extends PaginationQueryDto {
  @IsOptional()
  readonly searchNameTerm: string;

  @IsEnum(SortByField, { message: INCORRECT_TYPE_VALIDATION_ERROR })
  @IsOptional()
  readonly sortBy: keyof typeof SortByField = 'createdAt';
}
