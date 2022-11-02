import { IsEnum } from 'class-validator';
import { INCORRECT_TYPE_VALIDATION_ERROR } from '../consts/ad-validation-const';

export enum LikeStatusEnum {
  'None',
  'Like',
  'Dislike',
}

export class LikeStatusDto {
  @IsEnum(LikeStatusEnum, { message: INCORRECT_TYPE_VALIDATION_ERROR })
  readonly likeStatus: keyof typeof LikeStatusEnum = 'None';
}
