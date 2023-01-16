import { IsOptional, IsEnum } from 'class-validator';
import { INCORRECT_TYPE_VALIDATION_ERROR } from '../../../../consts/ad-validation-const';
import { PaginationQueryDto } from '../../../../global-dto/dto_validate/pagination-query.dto';
import { GetAllUsersMain } from '../main_instance/get-all-user.instance';

export enum SortByField {
  login,
  createdAt,
  email,
  attemptCount,
}

export class GetAllUsersQueryDto
  extends PaginationQueryDto
  implements GetAllUsersMain
{
  @IsOptional()
  readonly searchLoginTerm: string;

  @IsOptional()
  readonly searchEmailTerm: string;

  @IsEnum(SortByField, { message: INCORRECT_TYPE_VALIDATION_ERROR })
  @IsOptional()
  readonly sortBy: keyof typeof SortByField = 'createdAt';
}
