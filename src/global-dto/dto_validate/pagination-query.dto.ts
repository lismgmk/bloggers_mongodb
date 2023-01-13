import { Transform, Type } from 'class-transformer';
import { IsEnum, IsOptional, IsInt } from 'class-validator';
import { INCORRECT_TYPE_VALIDATION_ERROR } from '../../consts/ad-validation-const';
import { toNumber } from '../../helpers/helper-transform-number';
import { PaginationQueryMain } from '../main_interfaces/pagination-query.interface';

export enum SortDirection {
  desc,
  asc,
}

export class PaginationQueryDto implements PaginationQueryMain {
  @IsEnum(SortDirection, { message: INCORRECT_TYPE_VALIDATION_ERROR })
  @IsOptional()
  readonly sortDirection: keyof typeof SortDirection;

  @IsInt()
  @Transform(({ value }) => toNumber(value, { default: 1 }))
  @Type(() => Number)
  @IsOptional()
  public pageNumber = 1;

  @Transform(({ value }) => toNumber(value, { default: 10 }))
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  readonly pageSize: number = 10;
}
