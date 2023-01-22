import { IsEnum, IsOptional } from 'class-validator';
import { INCORRECT_TYPE_VALIDATION_ERROR } from '../../../../consts/ad-validation-const';
import { PaginationQueryDto } from '../../../../global-dto/dto_validate/pagination-query.dto';
import {
  GetAllCommentsMain,
  SortByFielComment,
} from '../main_instance/get-all-comments.instance';

export class GetAllCommentsDto
  extends PaginationQueryDto
  implements GetAllCommentsMain
{
  @IsEnum(SortByFielComment, { message: INCORRECT_TYPE_VALIDATION_ERROR })
  @IsOptional()
  readonly sortBy: keyof typeof SortByFielComment = 'createdAt';
}
