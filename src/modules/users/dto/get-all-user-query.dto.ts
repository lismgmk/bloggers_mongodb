import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'global-dto/pagination-query.dto';
import { INCORRECT_TYPE_VALIDATION_ERROR } from '../../../consts/ad-validation-const';

export enum SortByField {
  userName,
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
