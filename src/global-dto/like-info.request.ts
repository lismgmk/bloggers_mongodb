import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { INCORRECT_TYPE_VALIDATION_ERROR } from 'consts/ad-validation-const';
import { toNumber } from 'helpers/helper-transform-number';
import { Types } from 'mongoose';
import { SortDirection } from './pagination-query.dto';

enum LikeStatusEnum {
  'None',
  'Like',
  'Dislike',
}

export class NewestLikes {
  @IsString()
  readonly addedAt: Date;

  @IsString()
  readonly userId: Types.ObjectId;

  @IsString()
  readonly login: string;
}

export class LikeInfoRequest {
  @IsEnum(SortDirection, { message: INCORRECT_TYPE_VALIDATION_ERROR })
  readonly myStatus: keyof typeof LikeStatusEnum = 'None';

  @IsInt()
  @Transform(({ value }) => toNumber(value, { default: 0 }))
  readonly dislikesCount: number = 0;

  @Transform(({ value }) => toNumber(value, { default: 0 }))
  @IsInt()
  readonly likesCount: number = 0;

  @IsArray()
  @ValidateNested()
  @Type(() => NewestLikes)
  readonly newestLikes: NewestLikes[] = [];
}
