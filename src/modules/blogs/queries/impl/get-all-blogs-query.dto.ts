import { IsOptional, IsEnum } from 'class-validator';
import { INCORRECT_TYPE_VALIDATION_ERROR } from '../../../../consts/ad-validation-const';
import { PaginationQueryDto } from '../../../../global-dto/pagination-query.dto';

export enum SortByField {
  name,
  createdAt,
  description,
  websiteUrl,
}

export class GetAllBlogsQueryDto extends PaginationQueryDto {
  @IsOptional()
  readonly searchNameTerm: string;

  @IsEnum(SortByField, { message: INCORRECT_TYPE_VALIDATION_ERROR })
  @IsOptional()
  readonly sortBy: keyof typeof SortByField = 'createdAt';
}
