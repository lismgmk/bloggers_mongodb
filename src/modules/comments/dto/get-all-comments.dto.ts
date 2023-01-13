import { IsEnum, IsOptional } from 'class-validator';
import { INCORRECT_TYPE_VALIDATION_ERROR } from '../../../consts/ad-validation-const';
import { PaginationQueryDto } from '../../../global-dto/dto_validate/pagination-query.dto';

export enum SortByFielComment {
  createdAt,
  userLogin,
  content,
}

export class GetAllCommentsDto extends PaginationQueryDto {
  @IsEnum(SortByFielComment, { message: INCORRECT_TYPE_VALIDATION_ERROR })
  @IsOptional()
  readonly sortBy: keyof typeof SortByFielComment = 'createdAt';
}
