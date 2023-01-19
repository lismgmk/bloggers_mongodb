import { IsOptional, IsEnum } from 'class-validator';
import { INCORRECT_TYPE_VALIDATION_ERROR } from '../../../../consts/ad-validation-const';
import { PaginationQueryDto } from '../../../../global-dto/dto_validate/pagination-query.dto';
import { SortByBanStatus, SortByField } from '../dto_transfer/field-params';
import { GetAllUsersMain } from '../main_instance/get-all-user.instance';

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

  @IsEnum(SortByBanStatus, { message: INCORRECT_TYPE_VALIDATION_ERROR })
  @IsOptional()
  readonly banStatus: keyof typeof SortByBanStatus = 'all';
}
