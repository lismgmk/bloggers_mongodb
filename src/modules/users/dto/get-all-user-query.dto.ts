import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { INCORRECT_TYPE_VALIDATION_ERROR } from '../../../consts/ad-validation-const';

export enum SortDirection {
  desc,
  asc,
}
export enum SortByField {
  userName,
  createdAt,
  email,
  attemptCount,
}

export class GetAllUsersQueryDto {
  @IsOptional()
  readonly searchLoginTerm: string;

  @IsOptional()
  readonly searchEmailTerm: string;

  @IsEnum(SortByField, { message: INCORRECT_TYPE_VALIDATION_ERROR })
  @IsOptional()
  readonly sortBy: keyof typeof SortByField = 'createdAt';

  @IsEnum(SortDirection, { message: INCORRECT_TYPE_VALIDATION_ERROR })
  @IsOptional()
  readonly sortDirection: keyof typeof SortDirection;

  @IsInt()
  @IsOptional()
  readonly pageNumber: number = 1;

  @IsInt()
  @IsOptional()
  readonly pageSize: number = 10;
}
