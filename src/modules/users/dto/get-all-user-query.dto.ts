import { IsOptional, IsEnum } from 'class-validator';
import { INCORRECT_TYPE_VALIDATION_ERROR } from '../../../consts/ad-validation-const';
import { PaginationQueryDto } from '../../../global-dto/dto_validate/pagination-query.dto';

export enum SortByField {
  login,
  createdAt,
  email,
  attemptCount,
}

export class GetAllUsersQueryDto extends PaginationQueryDto {
  @IsOptional()
  readonly searchLoginTerm: string;

  @IsOptional()
  readonly searchEmailTerm: string;

  @IsEnum(SortByField, { message: INCORRECT_TYPE_VALIDATION_ERROR })
  @IsOptional()
  readonly sortBy: keyof typeof SortByField = 'createdAt';
}
