import { IsOptional, IsEnum } from 'class-validator';
import { INCORRECT_TYPE_VALIDATION_ERROR } from '../../../../consts/ad-validation-const';
import { PaginationQueryDto } from '../../../../global-dto/dto_validate/pagination-query.dto';
import { GetAllBlogsQueryMain } from '../main_instance/get-all-blogs.instance';

export enum SortByField {
  name,
  createdAt,
  description,
  websiteUrl,
}

export class GetAllBlogsQueryDto
  extends PaginationQueryDto
  implements GetAllBlogsQueryMain
{
  @IsOptional()
  readonly searchNameTerm: string;

  @IsEnum(SortByField, { message: INCORRECT_TYPE_VALIDATION_ERROR })
  @IsOptional()
  readonly sortBy: keyof typeof SortByField = 'createdAt';
}
